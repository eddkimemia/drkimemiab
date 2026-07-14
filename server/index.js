/**
 * Static site + M-Pesa STK checkout API
 * Run: npm start
 */
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";

import { getBook, listBooks, BOOK_PRICE } from "./books.js";
import { createOrder, updateOrder, findByCheckoutId, getOrder } from "./orders.js";
import { stkPush, parseStkCallback, normalizePhone, isMockMode } from "./mpesa.js";
import { notifyPurchaseSuccess, notifyPurchaseFailed } from "./notify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 3000);

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

function publicUrl() {
  return (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
}

function callbackUrl() {
  if (process.env.MPESA_CALLBACK_URL) return process.env.MPESA_CALLBACK_URL;
  return `${publicUrl()}/api/mpesa/callback`;
}

// ---- API ----

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mpesaMock: isMockMode(),
    bookPrice: BOOK_PRICE,
  });
});

app.get("/api/books", (_req, res) => {
  res.json({ books: listBooks() });
});

/**
 * POST /api/checkout
 * Body: { bookSlug, phone, email, name? }
 * Initiates M-Pesa STK push and creates a pending order.
 */
app.post("/api/checkout", async (req, res) => {
  try {
    const bookSlug = String(req.body.bookSlug || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const name = String(req.body.name || "").trim();
    const phoneRaw = req.body.phone;

    const book = getBook(bookSlug);
    if (!book) {
      return res.status(400).json({ ok: false, error: "Unknown book. Choose a book from the catalog." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "A valid email is required for delivery." });
    }

    let phone;
    try {
      phone = normalizePhone(phoneRaw);
    } catch (e) {
      return res.status(400).json({ ok: false, error: e.message });
    }

    const order = createOrder({
      bookSlug: book.slug,
      bookTitle: book.title,
      amount: BOOK_PRICE,
      currency: "KES",
      phone,
      email,
      name: name || null,
      status: "pending",
      delivery: "whatsapp_and_email",
    });

    const stk = await stkPush({
      phone,
      amount: BOOK_PRICE,
      accountReference: "DrKimemia",
      transactionDesc: "Book",
      callbackUrl: callbackUrl(),
    });

    updateOrder(order.id, {
      merchantRequestId: stk.merchantRequestId,
      checkoutRequestId: stk.checkoutRequestId,
      mpesaMock: Boolean(stk.mock),
      stkCustomerMessage: stk.customerMessage,
    });

    // In mock mode, auto-complete after a short delay so the UI can poll success
    if (stk.mock) {
      setTimeout(async () => {
        const current = getOrder(order.id);
        if (!current || current.status !== "pending") return;
        const paid = updateOrder(order.id, {
          status: "paid",
          resultCode: 0,
          resultDesc: "Mock payment completed",
          mpesaReceiptNumber: "MOCK" + Date.now().toString().slice(-8),
          paidAt: new Date().toISOString(),
        });
        try {
          await notifyPurchaseSuccess(paid);
        } catch (err) {
          console.error("notify error", err);
        }
      }, 4000);
    }

    res.json({
      ok: true,
      orderId: order.id,
      checkoutRequestId: stk.checkoutRequestId,
      amount: BOOK_PRICE,
      currency: "KES",
      book: { slug: book.slug, title: book.title },
      mock: Boolean(stk.mock),
      message:
        stk.customerMessage ||
        "Check your phone for the M-Pesa STK prompt and enter your PIN to complete payment.",
    });
  } catch (err) {
    console.error("checkout error", err);
    res.status(500).json({ ok: false, error: err.message || "Checkout failed" });
  }
});

/**
 * GET /api/orders/:id
 * Poll order status from the browser after STK.
 */
app.get("/api/orders/:id", (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ ok: false, error: "Order not found" });

  res.json({
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      bookTitle: order.bookTitle,
      bookSlug: order.bookSlug,
      amount: order.amount,
      currency: order.currency || "KES",
      mpesaReceiptNumber: order.mpesaReceiptNumber || null,
      resultDesc: order.resultDesc || null,
      mock: Boolean(order.mpesaMock),
    },
  });
});

/**
 * POST /api/mpesa/callback
 * Safaricom calls this after customer accepts/rejects STK.
 */
app.post("/api/mpesa/callback", async (req, res) => {
  // Always ack quickly so Safaricom does not retry forever
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const result = parseStkCallback(req.body);
    console.log("[mpesa callback]", result);

    let order =
      (result.checkoutRequestId && findByCheckoutId(result.checkoutRequestId)) || null;

    if (!order) {
      console.warn("No order for checkoutRequestId", result.checkoutRequestId);
      return;
    }

    if (order.status === "paid") return;

    if (result.success) {
      const paid = updateOrder(order.id, {
        status: "paid",
        resultCode: result.resultCode,
        resultDesc: result.resultDesc,
        mpesaReceiptNumber: result.mpesaReceiptNumber,
        paidAt: new Date().toISOString(),
        callbackPhone: result.phoneNumber,
        callbackAmount: result.amount,
      });
      await notifyPurchaseSuccess(paid);
    } else {
      const failed = updateOrder(order.id, {
        status: "failed",
        resultCode: result.resultCode,
        resultDesc: result.resultDesc,
      });
      await notifyPurchaseFailed(failed, result.resultDesc);
    }
  } catch (err) {
    console.error("callback handling error", err);
  }
});

// Static site
app.use(express.static(ROOT, { extensions: ["html"] }));

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.status(404).sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Dr. Kimemia site + M-Pesa API on http://localhost:${PORT}`);
  console.log(`M-Pesa mode: ${isMockMode() ? "MOCK (no Daraja keys — UI still works)" : "LIVE/" + (process.env.MPESA_ENV || "sandbox")}`);
  console.log(`Callback URL: ${callbackUrl()}`);
  console.log(`Book price: KES ${BOOK_PRICE}`);
});
