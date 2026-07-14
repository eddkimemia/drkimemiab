/**
 * Email notifications after successful (or failed) book purchase.
 * Works without SMTP in mock mode by logging to console.
 */
import nodemailer from "nodemailer";

function hasSmtp() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function getTransport() {
  if (!hasSmtp()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_PORT) === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || process.env.ADMIN_EMAIL || "noreply@drkimemia.com";
  const transport = await getTransport();

  if (!transport) {
    console.log("\n[email:mock]", { to, subject, text });
    return { mocked: true };
  }

  await transport.sendMail({ from, to, subject, text, html });
  return { mocked: false };
}

export async function notifyPurchaseSuccess(order) {
  const admin = process.env.ADMIN_EMAIL || "hello@drkimemia.com";
  const book = order.bookTitle || order.bookSlug;
  const receipt = order.mpesaReceiptNumber || "—";
  const amount = order.amount ?? 499;

  const adminText = [
    "New book purchase — PAID",
    `Order: ${order.id}`,
    `Book: ${book}`,
    `Amount: KES ${amount}`,
    `Customer phone: ${order.phone}`,
    `Customer email: ${order.email}`,
    `M-Pesa receipt: ${receipt}`,
    `Paid at: ${order.paidAt || new Date().toISOString()}`,
    "",
    "Action: deliver the digital book to the customer on WhatsApp and email.",
  ].join("\n");

  const customerText = [
    `Thank you for purchasing "${book}".`,
    "",
    `Amount paid: KES ${amount}`,
    `M-Pesa receipt: ${receipt}`,
    "",
    "Your book will be delivered to this email and your WhatsApp number shortly.",
    "If you need help, reply to this email or WhatsApp +254 715 135 141.",
    "",
    "— Dr. Edwin Kimemia",
  ].join("\n");

  await Promise.allSettled([
    sendMail({
      to: admin,
      subject: `Paid order: ${book} — ${order.phone}`,
      text: adminText,
    }),
    sendMail({
      to: order.email,
      subject: `Payment received — ${book}`,
      text: customerText,
    }),
  ]);
}

export async function notifyPurchaseFailed(order, reason) {
  const admin = process.env.ADMIN_EMAIL || "hello@drkimemia.com";
  await sendMail({
    to: admin,
    subject: `Failed / cancelled payment: ${order.bookTitle || order.bookSlug}`,
    text: [
      `Order: ${order.id}`,
      `Book: ${order.bookTitle || order.bookSlug}`,
      `Phone: ${order.phone}`,
      `Email: ${order.email}`,
      `Reason: ${reason || order.resultDesc || "unknown"}`,
    ].join("\n"),
  });
}
