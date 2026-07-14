# Dr. Edwin Kimemia — Website

Static multi-page site (dark theme only) with a Node.js M-Pesa STK checkout API.

## Run (recommended)

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm start
```

Open http://localhost:3000

Without Daraja keys, checkout runs in **mock mode** (UI + order flow still work).

## Rebuild pages

After editing `build-pages.mjs`:

```bash
npm run build:pages
```

## Book sales

- All books: **KES 499**
- **Pay on site** — M-Pesa STK push (`POST /api/checkout`)
- **Or WhatsApp** — +254 715 135 141
- After payment: delivered on **WhatsApp and email**

### M-Pesa setup (live / sandbox)

1. Create an app on [Safaricom Daraja](https://developer.safaricom.co.ke)
2. Put Consumer Key, Secret, Passkey, Shortcode in `.env`
3. Set `PUBLIC_URL` / `MPESA_CALLBACK_URL` to a **public HTTPS** URL  
   (use [ngrok](https://ngrok.com) when testing locally)
4. Set `MPESA_ENV=sandbox` or `production`
5. Optional SMTP vars for purchase emails

### API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/checkout` | Start STK (body: bookSlug, phone, email, name?) |
| GET | `/api/orders/:id` | Poll payment status |
| POST | `/api/mpesa/callback` | Safaricom STK callback |
| GET | `/api/books` | Catalog + price |
| GET | `/api/health` | Health + mock flag |

## Contact forms

Forms still post via [FormSubmit](https://formsubmit.co) to `hello@drkimemia.com`.

## Performance notes

- Shared `css/main.css` + `js/main.js`
- Floating WhatsApp button site-wide
- Express serves static files + API on one port
