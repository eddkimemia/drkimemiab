# Dr. Edwin Kimemia — Website

Static multi-page site (dark theme) with a **Node.js / Express** backend for **M-Pesa STK book checkout** and **purchase email notifications**.

| Layer | What it does |
|--------|----------------|
| Static HTML/CSS/JS | Marketing pages, book catalog, contact/speaking forms |
| `server/` | Express API: checkout, order status, M-Pesa callback, email |
| FormSubmit.co | Contact / newsletter / speaking forms (not the Node backend) |

**Requirements:** Node.js **18+** (this project uses native `fetch`).

---

## Quick start (local, no keys needed)

The easiest way to test is **mock mode**. If Daraja keys are missing, M-Pesa STK is simulated and payments auto-complete after ~4 seconds. Emails are printed to the server console instead of being sent.

```bash
# 1. Install dependencies
npm install

# 2. Create env file (optional for mock mode — defaults work)
copy .env.example .env
# macOS/Linux: cp .env.example .env

# 3. Start server (static site + API on one port)
npm start
# hot-reload while coding:
# npm run dev
```

Open **http://localhost:3000**

You should see in the terminal something like:

```text
Dr. Kimemia site + M-Pesa API on http://localhost:3000
M-Pesa mode: MOCK (no Daraja keys — UI still works)
Callback URL: http://localhost:3000/api/mpesa/callback
Book price: KES 499
```

### Rebuild static pages

Page HTML is generated from `build-pages.mjs`. After editing that file:

```bash
npm run build:pages
```

---

## Project structure

```text
drkimemia/
├── server/
│   ├── index.js      # Express app: static files + API routes
│   ├── mpesa.js      # Daraja OAuth + STK Push + callback parser
│   ├── notify.js     # Purchase emails (Nodemailer / console mock)
│   ├── orders.js     # JSON file order store
│   ├── books.js      # Book catalog + BOOK_PRICE
│   └── data/
│       └── orders.json   # Created at runtime (gitignored)
├── js/main.js        # Frontend: checkout polling + FormSubmit forms
├── css/main.css
├── books/            # Book detail pages (checkout forms)
├── .env.example
└── package.json
```

---

## Backend overview

### Payment (M-Pesa STK Push)

Flow:

1. Customer submits checkout form (book, phone, email) on a book page.
2. Browser `POST /api/checkout` → server creates a **pending** order and calls Safaricom STK Push.
3. Customer enters M-Pesa PIN on their phone.
4. Safaricom `POST /api/mpesa/callback` → order becomes **paid** or **failed**.
5. Frontend polls `GET /api/orders/:id` every 2s until status changes.
6. On **paid**, server emails admin + customer (see Email below).

**Mock mode** (`MPESA_MOCK=auto` and keys missing, or `MPESA_MOCK=true`):

- No call to Safaricom.
- After ~4 seconds the order is marked `paid` with a fake receipt (`MOCK…`).
- Purchase notifications still run (console or real SMTP if configured).

**Live / sandbox mode** needs Daraja credentials + a **public HTTPS** callback URL (use ngrok locally).

Phone numbers are normalized to `2547XXXXXXXX` or `2541XXXXXXXX` (Kenyan M-Pesa).

### Email

There are **two separate email paths**:

| Path | Used for | Backend |
|------|----------|---------|
| **Purchase emails** | After paid / failed book orders | Node (`server/notify.js` + Nodemailer) |
| **Contact forms** | Contact, newsletter, speaking | [FormSubmit.co](https://formsubmit.co) from the browser |

#### Purchase emails (`server/notify.js`)

Triggered after payment success or failure:

| Event | Recipients | Content |
|-------|------------|---------|
| Paid | `ADMIN_EMAIL` + buyer `email` | Admin: order details + “deliver on WhatsApp & email”. Buyer: thank-you / receipt |
| Failed / cancelled | `ADMIN_EMAIL` only | Order id, book, phone, email, reason |

Without SMTP (`SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` empty), messages are **logged to the console** as `[email:mock]`. That is enough for local UI testing.

**Important:** Digital book files are **not** attached automatically. Emails tell the admin to deliver the book on WhatsApp and email manually.

#### Contact / newsletter / speaking forms

Handled in `js/main.js` via FormSubmit (`https://formsubmit.co/ajax/…`). They do **not** use the Express API. First-time FormSubmit setup may require confirming the inbox email.

---

## Environment variables

Copy `.env.example` → `.env`. Never commit `.env`.

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Environment label |
| `PUBLIC_URL` | `http://localhost:3000` | Public site origin (used to build callback URL) |
| `BOOK_PRICE` | `499` | Price in KES (keep in sync with frontend copy) |
| `MPESA_ENV` | `sandbox` | `sandbox` or `production` |
| `MPESA_CONSUMER_KEY` | — | Daraja consumer key |
| `MPESA_CONSUMER_SECRET` | — | Daraja consumer secret |
| `MPESA_SHORTCODE` | `174379` | Paybill / till (sandbox default often `174379`) |
| `MPESA_PASSKEY` | — | Lipa Na M-Pesa Online passkey |
| `MPESA_ACCOUNT_REFERENCE` | `DrKimemia` | Shown on STK (max 12 chars) |
| `MPESA_TRANSACTION_DESC` | `Book purchase` | STK description (max 13 chars) |
| `MPESA_CALLBACK_URL` | derived from `PUBLIC_URL` | Full HTTPS URL to `/api/mpesa/callback` |
| `MPESA_MOCK` | `auto` | `auto` = mock if keys missing; `true` / `false` to force |
| `ADMIN_EMAIL` | `hello@drkimemia.com` | Admin purchase notifications |
| `SMTP_HOST` | — | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | `587` | Use `465` for SSL |
| `SMTP_USER` | — | SMTP username |
| `SMTP_PASS` | — | SMTP password / app password |
| `SMTP_FROM` | `ADMIN_EMAIL` or noreply | From header |

---

## How to test locally

### A. Mock mode (recommended first)

1. Ensure `.env` has **no** Daraja keys (or set `MPESA_MOCK=true`).
2. `npm start` → open http://localhost:3000
3. Open any book page, e.g. http://localhost:3000/books/dont-wait.html
4. Fill checkout:
   - **Phone:** `0712345678` (any valid Kenyan format)
   - **Email:** your address (delivery field; emails only leave the machine if SMTP is set)
5. Submit → UI should say demo/mock mode.
6. Within ~4–8 seconds status becomes **Payment received** with a mock receipt.
7. In the terminal, look for `[email:mock]` lines for admin + customer messages.
8. Orders are stored in `server/data/orders.json`.

#### API smoke tests (PowerShell)

```powershell
# Health (expect mpesaMock: true)
Invoke-RestMethod http://localhost:3000/api/health

# Catalog
Invoke-RestMethod http://localhost:3000/api/books

# Start checkout
$body = @{
  bookSlug = "dont-wait"
  phone    = "0712345678"
  email    = "you@example.com"
  name     = "Test Buyer"
} | ConvertTo-Json

$r = Invoke-RestMethod http://localhost:3000/api/checkout -Method POST -ContentType "application/json" -Body $body
$r

# Wait a few seconds, then poll
Start-Sleep -Seconds 5
Invoke-RestMethod "http://localhost:3000/api/orders/$($r.orderId)"
```

#### API smoke tests (curl / bash)

```bash
curl -s http://localhost:3000/api/health | jq

curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"bookSlug":"dont-wait","phone":"0712345678","email":"you@example.com","name":"Test Buyer"}'

# After ~4s, replace ORDER_ID:
curl -s http://localhost:3000/api/orders/ORDER_ID
```

#### Validation checks

| Case | Expected |
|------|----------|
| Invalid email | `400` — valid email required |
| Unknown `bookSlug` | `400` — unknown book |
| Bad phone (e.g. `123`) | `400` — valid Kenyan M-Pesa number |
| Missing server (`npm start` not running) | Browser: “Cannot reach the payment server…” |

Valid book slugs: `dont-wait`, `ai-powered-african`, `prevention-blueprint`, `healthy-living`.

---

### B. Real email locally (SMTP)

Purchase notifications use Nodemailer when SMTP is set.

Example Gmail (use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password):

```env
ADMIN_EMAIL=your-admin@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-admin@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM="Dr. Kimemia Books <your-admin@gmail.com>"
```

Then run mock checkout again. You should receive:

1. **Admin:** “Paid order: …”
2. **Customer:** “Payment received — …” at the email you entered in the form

If SMTP is wrong, checkout still succeeds; check the server log for send errors.

**Contact forms** are separate: they go through FormSubmit and need network access + FormSubmit activation for `hello@drkimemia.com` (or whatever is configured on the form).

---

### C. M-Pesa sandbox (real STK on a phone)

Safaricom’s callback must reach your machine over **public HTTPS**. Localhost alone is not enough.

#### 1. Daraja app

1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke).
2. Create an app; enable **Lipa Na M-Pesa Online**.
3. Copy Consumer Key, Consumer Secret, Passkey, and Shortcode (sandbox often uses shortcode `174379`).

#### 2. Tunnel

```bash
# Example with ngrok
ngrok http 3000
```

Note the HTTPS URL, e.g. `https://abc123.ngrok-free.app`.

#### 3. `.env`

```env
PORT=3000
PUBLIC_URL=https://abc123.ngrok-free.app
MPESA_CALLBACK_URL=https://abc123.ngrok-free.app/api/mpesa/callback

MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_MOCK=false

# Optional but recommended while testing sandbox
ADMIN_EMAIL=you@example.com
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

Restart the server. Startup log should show **LIVE/sandbox** (not MOCK).

#### 4. Pay with sandbox test MSISDN

Use the sandbox test phone numbers and PINs from the Daraja docs / simulator for your shortcode. Fill them into the on-site checkout form, complete the STK prompt, and confirm:

- Order status → `paid` via `GET /api/orders/:id`
- Server log: `[mpesa callback] …`
- Emails sent (if SMTP configured)

To simulate a failed payment without a phone, you can POST a callback body (see API section).

---

### D. Simulating the M-Pesa callback

Useful when debugging callback handling without waiting for Safaricom.

```powershell
# Use a real checkoutRequestId from a pending order in server/data/orders.json
$callback = @{
  Body = @{
    stkCallback = @{
      MerchantRequestID = "mock-merchant"
      CheckoutRequestID = "ws_CO_...."   # must match order
      ResultCode = 0
      ResultDesc = "The service request is processed successfully."
      CallbackMetadata = @{
        Item = @(
          @{ Name = "Amount"; Value = 499 }
          @{ Name = "MpesaReceiptNumber"; Value = "TEST12345" }
          @{ Name = "PhoneNumber"; Value = 254712345678 }
        )
      }
    }
  }
} | ConvertTo-Json -Depth 6

Invoke-RestMethod http://localhost:3000/api/mpesa/callback -Method POST -ContentType "application/json" -Body $callback
```

For a **failed** payment, set `ResultCode` to a non-zero value (e.g. `1032`) and omit `CallbackMetadata`. Admin gets a failure email (or console mock).

---

## API reference

Base URL: `http://localhost:3000` (or your `PUBLIC_URL`).

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | `{ ok, mpesaMock, bookPrice }` |
| `GET` | `/api/books` | Catalog + price |
| `POST` | `/api/checkout` | Start STK; create pending order |
| `GET` | `/api/orders/:id` | Poll payment status |
| `POST` | `/api/mpesa/callback` | Safaricom STK result (always ACKs quickly) |

### `POST /api/checkout`

**Body (JSON):**

```json
{
  "bookSlug": "dont-wait",
  "phone": "0712345678",
  "email": "buyer@example.com",
  "name": "Optional name"
}
```

**Success (200):**

```json
{
  "ok": true,
  "orderId": "uuid",
  "checkoutRequestId": "ws_CO_...",
  "amount": 499,
  "currency": "KES",
  "book": { "slug": "dont-wait", "title": "..." },
  "mock": true,
  "message": "..."
}
```

### `GET /api/orders/:id`

Returns `status`: `pending` | `paid` | `failed`, plus receipt when paid.

### `POST /api/mpesa/callback`

Expects Safaricom’s STK callback JSON. Always responds:

```json
{ "ResultCode": 0, "ResultDesc": "Accepted" }
```

Then updates the order and sends notifications asynchronously.

---

## Order storage

Orders are stored in **`server/data/orders.json`** (created automatically, gitignored).

Each order roughly includes:

- `id`, `status`, `bookSlug`, `bookTitle`, `amount`, `currency`
- `phone`, `email`, `name`
- `checkoutRequestId`, `merchantRequestId`, `mpesaReceiptNumber`
- `paidAt`, `resultDesc`, `mpesaMock`

This is fine for development and light traffic. Replace with a real database before high volume.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run Express (static + API) |
| `npm run dev` | Same with `node --watch` |
| `npm run build:pages` | Regenerate HTML from `build-pages.mjs` |

---

## Book sales (product)

- All books: **KES 499** (override with `BOOK_PRICE`)
- **Pay on site** — M-Pesa STK (`POST /api/checkout`)
- **Or WhatsApp** — +254 715 135 141
- After payment: intended delivery on **WhatsApp and email** (manual fulfillment after admin notification)

---

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Port in use / `EADDRINUSE` | Another process on 3000; stop it or set `PORT=3001` |
| “Cannot reach the payment server” | Site must be served via `npm start`, not a plain static file server |
| Always MOCK despite keys | Keys empty/whitespace, or `MPESA_MOCK=true` |
| STK never completes (sandbox) | Callback URL not public HTTPS; ngrok stopped; wrong `MPESA_CALLBACK_URL` |
| OAuth / STK errors | Keys, shortcode, passkey, and `MPESA_ENV` match Daraja app |
| No purchase emails | SMTP vars; check console for `[email:mock]` or SMTP errors |
| Contact form fails | FormSubmit activation / network; fallback opens `mailto:` |
| Order stuck `pending` | Callback not received; in mock, wait ~4s; check `orders.json` |

---

## Production checklist

1. Set `NODE_ENV=production`, real `PUBLIC_URL` (HTTPS).
2. Set full Daraja **production** credentials; `MPESA_ENV=production`; `MPESA_MOCK=false`.
3. Point `MPESA_CALLBACK_URL` at `https://your-domain.com/api/mpesa/callback`.
4. Configure reliable SMTP; verify admin + customer receive paid emails.
5. Process for manual book delivery (WhatsApp + email) when admin is notified.
6. Back up or migrate off `orders.json` if order volume grows.
7. Confirm FormSubmit (or replace with your own contact endpoint) for public forms.

---

## Architecture notes / limitations

- **No Stripe / card payments** — M-Pesa STK only.
- **No automated WhatsApp API** — WhatsApp links + manual delivery after paid email.
- **No PDF attachment** in purchase emails — admin is prompted to deliver the file.
- **Contact email ≠ purchase email** — FormSubmit vs Nodemailer.
- **Orders file store** — simple, not multi-instance safe.
- Callback handler ACKs Safaricom immediately, then processes asynchronously (correct pattern).

---

## License / contact

Site content © Dr. Edwin Kimemia.  
Inquiries: [hello@drkimemia.com](mailto:hello@drkimemia.com) · WhatsApp +254 715 135 141
