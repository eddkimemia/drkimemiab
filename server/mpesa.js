/**
 * Safaricom Daraja STK Push (Lipa Na M-Pesa Online)
 * Docs: https://developer.safaricom.co.ke
 */

const SANDBOX_BASE = "https://sandbox.safaricom.co.ke";
const PRODUCTION_BASE = "https://api.safaricom.co.ke";

function baseUrl() {
  return (process.env.MPESA_ENV || "sandbox").toLowerCase() === "production"
    ? PRODUCTION_BASE
    : SANDBOX_BASE;
}

function useMock() {
  const flag = (process.env.MPESA_MOCK || "auto").toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  // auto: mock when credentials are missing
  return !(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_PASSKEY);
}

let cachedToken = { value: null, expiresAt: 0 };

async function getAccessToken() {
  if (cachedToken.value && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error("M-Pesa consumer key/secret not configured");
  }

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(
    `${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`M-Pesa OAuth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const ttlMs = (Number(data.expires_in) || 3599) * 1000;
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + ttlMs - 60_000,
  };
  return cachedToken.value;
}

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds())
  );
}

function password(shortcode, passkey, ts) {
  return Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");
}

/** Normalize Kenyan mobile to 2547XXXXXXXX */
export function normalizePhone(input) {
  let p = String(input || "").replace(/[\s\-\(\)]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0") && p.length === 10) p = "254" + p.slice(1);
  if (p.startsWith("7") && p.length === 9) p = "254" + p;
  if (p.startsWith("1") && p.length === 9) p = "254" + p;
  if (!/^254[17]\d{8}$/.test(p)) {
    throw new Error("Enter a valid Kenyan M-Pesa number (e.g. 07XX XXX XXX or 2547XXXXXXXX)");
  }
  return p;
}

/**
 * Initiate STK Push
 * @returns {{ mock: boolean, merchantRequestId, checkoutRequestId, customerMessage, responseCode, responseDescription }}
 */
export async function stkPush({ phone, amount, accountReference, transactionDesc, callbackUrl }) {
  const phoneNumber = normalizePhone(phone);
  const amt = Math.round(Number(amount));
  if (!Number.isFinite(amt) || amt < 1) {
    throw new Error("Invalid amount");
  }

  if (useMock()) {
    const id = "MOCK" + Date.now();
    return {
      mock: true,
      merchantRequestId: id,
      checkoutRequestId: "ws_CO_" + id,
      responseCode: "0",
      responseDescription: "Success. Request accepted for processing (mock)",
      customerMessage: "Mock STK sent. In sandbox/production you will get a real M-Pesa prompt.",
      phoneNumber,
      amount: amt,
    };
  }

  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  if (!shortcode || !passkey) {
    throw new Error("M-Pesa shortcode/passkey not configured");
  }
  if (!callbackUrl) {
    throw new Error("MPESA_CALLBACK_URL or PUBLIC_URL required for STK callback");
  }

  const ts = timestamp();
  const token = await getAccessToken();
  const body = {
    BusinessShortCode: shortcode,
    Password: password(shortcode, passkey, ts),
    Timestamp: ts,
    TransactionType: "CustomerPayBillOnline",
    Amount: amt,
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackUrl,
    AccountReference: (accountReference || process.env.MPESA_ACCOUNT_REFERENCE || "DrKimemia").slice(0, 12),
    TransactionDesc: (transactionDesc || process.env.MPESA_TRANSACTION_DESC || "Book purchase").slice(0, 13),
  };

  const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.errorCode || (data.ResponseCode && data.ResponseCode !== "0")) {
    const msg =
      data.errorMessage ||
      data.ResponseDescription ||
      data.errorCode ||
      `STK push failed (${res.status})`;
    throw new Error(msg);
  }

  return {
    mock: false,
    merchantRequestId: data.MerchantRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    responseCode: data.ResponseCode,
    responseDescription: data.ResponseDescription,
    customerMessage: data.CustomerMessage,
    phoneNumber,
    amount: amt,
  };
}

/**
 * Parse Safaricom STK callback body into a flat result.
 */
export function parseStkCallback(body) {
  const cb = body?.Body?.stkCallback || body?.stkCallback || {};
  const resultCode = Number(cb.ResultCode);
  const resultDesc = cb.ResultDesc || "";
  const checkoutRequestId = cb.CheckoutRequestID;
  const merchantRequestId = cb.MerchantRequestID;

  const meta = {};
  const items = cb.CallbackMetadata?.Item || [];
  for (const item of items) {
    if (item.Name) meta[item.Name] = item.Value;
  }

  return {
    resultCode,
    resultDesc,
    checkoutRequestId,
    merchantRequestId,
    success: resultCode === 0,
    amount: meta.Amount,
    mpesaReceiptNumber: meta.MpesaReceiptNumber,
    transactionDate: meta.TransactionDate,
    phoneNumber: meta.PhoneNumber,
  };
}

export function isMockMode() {
  return useMock();
}
