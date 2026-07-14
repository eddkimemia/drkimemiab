/**
 * Generates all HTML pages with shared head/nav/footer.
 * Run: node build-pages.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

/** WhatsApp order number (international, no +) */
const WA_PHONE = "254715135141";
const WA_DISPLAY = "+254 715 135 141";
const BOOK_PRICE = "KES 499";

function waLink(message) {
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
}

function waBuyMessage(title) {
  return `Hello Dr. Kimemia, I want to buy "${title}" for ${BOOK_PRICE}. Please send me an M-Pesa STK push. My phone number for payment is: [your number]. After payment, please deliver the book to this WhatsApp and my email: [your email].`;
}

function waGeneralMessage() {
  return "Hello Dr. Kimemia, I found your website and would like to chat.";
}

const PAY_NOTE =
  "KES 499 · Pay on site (M-Pesa STK) or WhatsApp · Delivered on WhatsApp & email after purchase";

/** On-site M-Pesa checkout form + WhatsApp alternative */
function purchaseBox(root, { slug, title, idSuffix = "" }) {
  const formId = `checkout-form${idSuffix}`;
  const statusId = `checkout-status${idSuffix}`;
  return `
  <div class="purchase-box reveal" id="buy${idSuffix}" data-book-slug="${slug}" data-book-title="${title.replace(/"/g, "&quot;")}">
    <div class="purchase-box-head">
      <h3>Buy this book · ${BOOK_PRICE}</h3>
      <p class="text-sm muted">Pay with M-Pesa on this site, or order on WhatsApp. After payment, the book is sent to your WhatsApp and email.</p>
    </div>
    <form class="form checkout-form" id="${formId}" data-checkout-form novalidate>
      <input type="hidden" name="bookSlug" value="${slug}">
      <div class="form-group">
        <label for="co-name${idSuffix}">Full name (optional)</label>
        <input id="co-name${idSuffix}" name="name" type="text" autocomplete="name" placeholder="Your name">
      </div>
      <div class="form-row form-row--2">
        <div class="form-group">
          <label for="co-phone${idSuffix}">M-Pesa phone *</label>
          <input id="co-phone${idSuffix}" name="phone" type="tel" required inputmode="tel" autocomplete="tel" placeholder="07XX XXX XXX" pattern="[0-9+\\s\\-]{9,15}">
          <p class="form-error">Enter a valid M-Pesa number.</p>
        </div>
        <div class="form-group">
          <label for="co-email${idSuffix}">Email for delivery *</label>
          <input id="co-email${idSuffix}" name="email" type="email" required autocomplete="email" placeholder="you@example.com">
          <p class="form-error">Valid email required.</p>
        </div>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Pay ${BOOK_PRICE} · M-Pesa STK push</button>
      <p class="form-note">You will get an STK prompt on your phone. Enter your M-Pesa PIN to complete.</p>
      <div id="${statusId}" class="checkout-status" role="status" aria-live="polite" hidden></div>
    </form>
    <div class="purchase-divider"><span>or</span></div>
    <a class="btn btn-whatsapp btn-block" href="${waLink(waBuyMessage(title))}" target="_blank" rel="noopener noreferrer">${icon("whatsapp")} Buy via WhatsApp · ${WA_DISPLAY}</a>
  </div>`;
}

function icons() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" class="sr-only" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M4 12h16M4 19h16"/></symbol>
  <symbol id="i-whatsapp" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></symbol>
  <symbol id="i-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></symbol>
  <symbol id="i-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></symbol>
  <symbol id="i-arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7M12 19V5"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></symbol>
  <symbol id="i-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></symbol>
  <symbol id="i-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></symbol>
  <symbol id="i-linkedin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></symbol>
  <symbol id="i-twitter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></symbol>
  <symbol id="i-instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/></symbol>
  <symbol id="i-youtube" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></symbol>
  <symbol id="i-facebook" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></symbol>
</svg>`;
}

function icon(name, cls = "") {
  return `<svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-${name}" xlink:href="#i-${name}"/></svg>`;
}

function head({ title, description, root, page, canonical, extra = "" }) {
  const canon = canonical || `https://drkimemia.com/${page === "home" ? "" : page + (page.includes(".html") || page.includes("/") ? "" : ".html")}`;
  // Fix canonical for multi-segment
  let canonPath = "";
  if (page === "home") canonPath = "https://drkimemia.com/";
  else if (canonical) canonPath = canonical;
  else canonPath = "https://drkimemia.com/" + page;

  return `<!DOCTYPE html>
<html lang="en" class="dark" data-root="${root}" data-page="${page === "home" ? "home" : page.split("/")[0].replace(".html", "")}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#0a0a0a">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="Dr. Edwin Kimemia">
  <meta property="og:title" content="${title.replace(/"/g, "&quot;")}">
  <meta property="og:description" content="${description.replace(/"/g, "&quot;")}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonPath}">
  <meta property="og:image" content="https://drkimemia.com/images/og-default.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title.replace(/"/g, "&quot;")}">
  <meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}">
  <link rel="canonical" href="${canonPath}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${root}css/main.css">
  ${extra}
</head>`;
}

function nav(root) {
  const r = root;
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <div id="reading-progress" aria-hidden="true"></div>
  ${icons()}
  <header class="site-header">
  <nav id="main-nav" class="nav" aria-label="Primary">
    <div class="container nav-inner">
      <a href="${r}index.html" class="logo">
        <span class="logo-mark">K</span>
        <span class="logo-text">Dr. Edwin Kimemia</span>
      </a>
      <div class="nav-links" id="desktop-nav">
        <a href="${r}index.html" class="nav-link" data-nav="home">Home</a>
        <a href="${r}about.html" class="nav-link" data-nav="about">About</a>
        <a href="${r}books.html" class="nav-link" data-nav="books">Books</a>
        <a href="${r}speaking.html" class="nav-link" data-nav="speaking">Speaking</a>
        <a href="${r}blog.html" class="nav-link" data-nav="blog">Blog</a>
        <a href="${r}contact.html" class="nav-link" data-nav="contact">Contact</a>
      </div>
      <div class="nav-actions">
        <button type="button" id="search-btn" class="icon-btn" aria-label="Open search" aria-haspopup="dialog">
          ${icon("search")}
        </button>
        <a href="${r}contact.html#newsletter" class="btn btn-primary btn-sm nav-cta">${icon("mail")} Subscribe</a>
        <button type="button" id="menu-toggle" class="icon-btn menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
          <span id="menu-icon-open" class="menu-icon">${icon("menu")}</span>
          <span id="menu-icon-close" class="menu-icon hidden">${icon("x")}</span>
        </button>
      </div>
    </div>
  </nav>

  <div id="mobile-menu" class="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation" hidden>
    <div class="mobile-menu-panel">
      <nav class="mobile-nav-list" aria-label="Mobile">
        <a href="${r}index.html" class="mobile-nav-link" data-nav="home">Home</a>
        <a href="${r}about.html" class="mobile-nav-link" data-nav="about">About</a>
        <a href="${r}books.html" class="mobile-nav-link" data-nav="books">Books</a>
        <a href="${r}speaking.html" class="mobile-nav-link" data-nav="speaking">Speaking</a>
        <a href="${r}blog.html" class="mobile-nav-link" data-nav="blog">Blog</a>
        <a href="${r}contact.html" class="mobile-nav-link" data-nav="contact">Contact</a>
      </nav>
      <div class="mobile-menu-footer">
        <a href="${waLink(waGeneralMessage())}" class="btn btn-whatsapp btn-block mobile-nav-link" target="_blank" rel="noopener noreferrer">${icon("whatsapp")} Chat on WhatsApp</a>
        <a href="${r}contact.html#newsletter" class="btn btn-primary btn-block mobile-nav-link">${icon("mail")} Join the Newsletter</a>
      </div>
    </div>
  </div>
  </header>

  <div id="search-modal" class="search-modal" role="dialog" aria-modal="true" aria-label="Search site" aria-hidden="true">
    <div class="search-box">
      <div class="search-field">
        ${icon("search")}
        <input id="search-input" type="search" placeholder="Search books, articles, topics…" autocomplete="off" aria-label="Search">
        <button type="button" id="search-close" class="icon-btn" aria-label="Close search">${icon("x")}</button>
      </div>
      <div id="search-results" class="search-results"></div>
    </div>
  </div>`;
}

function footer(root) {
  const r = root;
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <span class="logo-mark" style="background:var(--gold-500);color:var(--navy-900)">K</span>
            <span class="logo-text" style="color:#fff">Dr. Edwin Kimemia</span>
          </div>
          <p>Helping Africa live longer through knowledge. Clinician, author, educator, and advocate for preventive healthcare.</p>
          <div class="footer-social">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">${icon("twitter")}</a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${icon("linkedin")}</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${icon("instagram")}</a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">${icon("youtube")}</a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${icon("facebook")}</a>
          </div>
        </div>
        <div>
          <h4>Navigate</h4>
          <ul>
            <li><a href="${r}index.html">Home</a></li>
            <li><a href="${r}about.html">About</a></li>
            <li><a href="${r}books.html">Books</a></li>
            <li><a href="${r}speaking.html">Speaking</a></li>
            <li><a href="${r}blog.html">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4>More</h4>
          <ul>
            <li><a href="${r}contact.html">Contact</a></li>
            <li><a href="${r}contact.html#newsletter">Newsletter</a></li>
            <li><a href="${waLink(waGeneralMessage())}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href="${r}privacy.html">Privacy</a></li>
          </ul>
        </div>
        <div>
          <h4>Books</h4>
          <ul>
            <li><a href="${r}books/dont-wait.html">Don't Wait Until You're Sick</a></li>
            <li><a href="${r}books/ai-powered-african.html">The AI-Powered African</a></li>
            <li><a href="${r}books/prevention-blueprint.html">The Prevention Blueprint</a></li>
            <li><a href="${r}books/healthy-living.html">Healthy Living Simplified</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© <span data-year></span> Dr. Edwin Kimemia. All rights reserved.</p>
        <div class="footer-legal">
          <a href="${r}privacy.html">Privacy Policy</a>
          <a href="${r}terms.html">Terms of Service</a>
          <a href="${r}cookies.html">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>

  <div id="toast" class="toast" aria-live="polite">
    <div class="toast-icon">${icon("check")}</div>
    <span id="toast-message">Success!</span>
  </div>
  <button type="button" id="back-to-top" class="back-top" aria-label="Back to top">${icon("arrow-up")}</button>
  <a href="${waLink(waGeneralMessage())}" class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat with Me on WhatsApp ${WA_DISPLAY}">
    ${icon("whatsapp", "whatsapp-float-icon")}
    <span class="whatsapp-float-label">Chat with Me</span>
  </a>
  <script src="${root}js/main.js" defer></script>`;
}

function page(opts, body) {
  return (
    head(opts) +
    "\n<body>\n" +
    nav(opts.root) +
    "\n<main id=\"main\">\n" +
    body +
    "\n</main>\n" +
    footer(opts.root) +
    "\n</body>\n</html>\n"
  );
}

function write(rel, html) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, "utf8");
  console.log("wrote", rel);
}

// ---------- Book card helper ----------
function bookCard(root, { slug, cover, tag, title, blurb, chip, chipClass, rating, pages, categories }) {
  return `
  <article class="book-card reveal" data-category="${categories}">
    <a href="${root}books/${slug}.html" class="book-cover ${cover}">
      <span class="book-tag">${tag}</span>
      <div>
        <h3>${title}</h3>
        <p>${blurb}</p>
      </div>
      <div class="book-meta">
        <span>Dr. Edwin Kimemia</span>
        <span aria-label="${rating} out of 5 stars">★ ${rating}</span>
      </div>
    </a>
    <div class="book-info">
      <div class="book-info-top">
        <span class="chip ${chipClass || ""}">${chip}</span>
        <span class="book-price">${BOOK_PRICE}</span>
      </div>
      <p class="book-delivery text-xs muted">${PAY_NOTE}</p>
      <div class="book-actions">
        <a class="btn btn-primary" href="${root}books/${slug}.html#buy">Buy · ${BOOK_PRICE}</a>
        <a class="btn btn-whatsapp" href="${waLink(waBuyMessage(title))}" target="_blank" rel="noopener noreferrer">${icon("whatsapp")} WhatsApp</a>
      </div>
    </div>
  </article>`;
}

const books = [
  {
    slug: "dont-wait",
    cover: "cover-1",
    tag: "Bestseller",
    title: "Don't Wait Until You're Sick",
    blurb: "A practical guide to preventive healthcare for every African family.",
    chip: "Health",
    rating: "4.9",
    pages: "320",
    categories: "health prevention",
    long: "This book translates clinical prevention into plain language for African households—screenings, habits, and early warning signs that save lives.",
  },
  {
    slug: "ai-powered-african",
    cover: "cover-2",
    tag: "New Release",
    title: "The AI-Powered African",
    blurb: "How artificial intelligence is transforming healthcare across the continent.",
    chip: "AI & Tech",
    chipClass: "chip--cyan",
    rating: "4.8",
    pages: "280",
    categories: "tech",
    long: "A clinician’s map of AI opportunities in African health systems—diagnostics, access, ethics, and practical adoption paths.",
  },
  {
    slug: "prevention-blueprint",
    cover: "cover-3",
    tag: "Essential Guide",
    title: "The Prevention Blueprint",
    blurb: "Your step-by-step guide to staying healthy and avoiding disease.",
    chip: "Health",
    rating: "4.9",
    pages: "250",
    categories: "health prevention",
    long: "A structured playbook for personal and community prevention: checklists, age-based actions, and clinic-ready habits.",
  },
  {
    slug: "healthy-living",
    cover: "cover-4",
    tag: "Popular",
    title: "Healthy Living Simplified",
    blurb: "Evidence-based wellness for everyday life, made simple.",
    chip: "Lifestyle",
    rating: "4.7",
    pages: "200",
    categories: "lifestyle health",
    long: "Nutrition, movement, sleep, and mental health—without fads—grounded in evidence and African food realities.",
  },
];

// ==================== PAGES ====================

// HOME
write(
  "index.html",
  page(
    {
      title: "Dr. Edwin Kimemia — Clinician, Author, Educator",
      description:
        "Dr. Edwin Kimemia is a medical author, clinician, and public health educator. Discover books on disease prevention, AI in healthcare, and healthy living.",
      root: "",
      page: "home",
      canonical: "https://drkimemia.com/",
      extra: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Person","name":"Dr. Edwin Kimemia","jobTitle":["Clinician","Medical Author","Public Health Educator"],"url":"https://drkimemia.com","sameAs":["https://twitter.com/","https://www.linkedin.com/","https://www.youtube.com/"],"knowsAbout":["Disease Prevention","Public Health","Medical Education","AI in Healthcare"]}
</script>`,
    },
    `
  <section class="hero" id="home">
    <div class="container hero-grid">
      <div>
        <div class="badge reveal"><span class="pulse" aria-hidden="true"></span> Clinician · Author · Educator</div>
        <h1 class="reveal">Building a <span class="italic gold">Healthier</span> Africa, One Book at a Time.</h1>
        <p class="lead reveal mt-6">Helping people make better health decisions through evidence-based medical education. Prevent disease. Empower lives. Build healthier communities.</p>
        <div class="hero-actions reveal">
          <a href="books.html" class="btn btn-primary">${icon("book")} Explore My Books</a>
          <a href="about.html" class="btn btn-secondary">Meet Dr. Kimemia</a>
          <a href="speaking.html" class="btn btn-ghost">${icon("mic")} Book Me to Speak</a>
        </div>
        <div class="stats reveal">
          <div class="stat"><strong data-count="4">0</strong><span>Books Published</span></div>
          <div class="stat-divider" aria-hidden="true"></div>
          <div class="stat"><strong data-count="50000">0</strong><span>Readers Reached</span></div>
          <div class="stat-divider" aria-hidden="true"></div>
          <div class="stat"><strong data-count="100">0</strong><span>Speaking Engagements</span></div>
        </div>
      </div>
      <div class="portrait-wrap reveal">
        <div class="portrait">
          <div class="img-fallback" role="img" aria-label="Dr. Edwin Kimemia">Dr. Edwin Kimemia</div>
        </div>
        <div class="portrait-frame" aria-hidden="true"></div>
        <div class="portrait-badge">
          <div class="portrait-badge-icon">${icon("heart")}</div>
          <div>
            <strong>Evidence-Based</strong>
            <span>Medical Education</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="trust-bar" aria-label="As featured in">
    <div class="container">
      <p>As Featured In</p>
      <div class="trust-logos">
        <span>Nation Media</span><span>KTN News</span><span>Citizen TV</span>
        <span>The Standard</span><span>BBC Africa</span><span>KPMG</span>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head reveal">
        <div class="label-row"><span class="label">About</span><div class="label-line"></div></div>
        <h2>A clinician on a mission to <span class="italic gold">transform</span> health knowledge</h2>
        <p class="lead mt-4">With years of clinical experience across East Africa, Dr. Kimemia writes to bridge medical science and everyday understanding—so families can act before crisis hits.</p>
        <a href="about.html" class="link-more mt-4">Read full biography ${icon("arrow-right")}</a>
      </div>
      <div class="grid lg-grid-4">
        <div class="card reveal"><div class="card-icon card-icon--green">${icon("heart")}</div><h3>Simple Language</h3><p class="text-sm muted mt-2">No jargon—written so families can understand and clinicians would approve.</p></div>
        <div class="card reveal"><div class="card-icon">${icon("book")}</div><h3>Evidence-Based</h3><p class="text-sm muted mt-2">Claims grounded in research and real-world clinical practice.</p></div>
        <div class="card reveal"><div class="card-icon card-icon--navy">${icon("mic")}</div><h3>African Context</h3><p class="text-sm muted mt-2">Addresses diseases, diets, and realities that shape African health daily.</p></div>
        <div class="card reveal"><div class="card-icon card-icon--green">${icon("check")}</div><h3>Actionable Steps</h3><p class="text-sm muted mt-2">Practical steps you can take today—not just information.</p></div>
      </div>
    </div>
  </section>

  <section class="section section--muted" id="books-preview">
    <div class="container">
      <div class="section-head section-head--split reveal">
        <div>
          <div class="label-row"><span class="label">Books</span><div class="label-line"></div></div>
          <h2>Featured <span class="italic">Works</span></h2>
          <p class="lead mt-4">Each book bridges medical science and everyday life—written for Africans, by an African clinician.</p>
        </div>
        <a href="books.html" class="link-more">View all books ${icon("arrow-right")}</a>
      </div>
      <div class="grid sm-grid-2 lg-grid-4">
        ${books.map((b) => bookCard("", b)).join("")}
      </div>
    </div>
  </section>

  <section class="section section--navy">
    <div class="container">
      <div class="grid lg-grid-2" style="align-items:center">
        <div class="reveal">
          <div class="label-row"><span class="label" style="color:var(--gold-400)">Speaking</span><div class="label-line"></div></div>
          <h2 style="color:#fff">Inspiring audiences to <span class="italic" style="color:var(--gold-400)">rethink</span> health</h2>
          <p class="mt-4" style="color:var(--zinc-400);font-weight:300;line-height:1.7">Keynotes that are medically rigorous and deeply human—on prevention, technology, and the future of African health.</p>
          <a href="speaking.html" class="btn btn-gold mt-8">${icon("mic")} Book a keynote</a>
        </div>
        <div class="space-y-4 reveal">
          <div class="topic"><h4>Disease Prevention as a Lifestyle</h4><p>Why the best medicine is the one you never need.</p></div>
          <div class="topic"><h4>AI in African Healthcare</h4><p>How AI can leapfrog infrastructure challenges.</p></div>
          <div class="topic"><h4>Medical Entrepreneurship</h4><p>Building healthcare businesses that serve communities.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head section-head--split reveal">
        <div>
          <div class="label-row"><span class="label">Blog</span><div class="label-line"></div></div>
          <h2>Latest <span class="italic">Insights</span></h2>
        </div>
        <a href="blog.html" class="link-more">All articles ${icon("arrow-right")}</a>
      </div>
      <div class="grid md-grid-3">
        <article class="media-card reveal">
          <a href="blog/prevention-is-better.html" class="media-thumb"><div class="img-fallback">Prevention</div><span class="media-tag media-tag--green">Prevention</span></a>
          <div class="media-body">
            <div class="meta"><time datetime="2024-12-15">Dec 15, 2024</time> · 8 min</div>
            <h3><a href="blog/prevention-is-better.html">Why Prevention Is Better Than Cure — And Why Systems Stay Reactive</a></h3>
            <a href="blog/prevention-is-better.html" class="link-more">Read more ${icon("arrow-right")}</a>
          </div>
        </article>
        <article class="media-card reveal">
          <a href="blog/ai-healthcare-kenya.html" class="media-thumb"><div class="img-fallback">AI & Health</div><span class="media-tag media-tag--cyan">Technology</span></a>
          <div class="media-body">
            <div class="meta"><time datetime="2024-11-28">Nov 28, 2024</time> · 6 min</div>
            <h3><a href="blog/ai-healthcare-kenya.html">5 Ways AI Is Already Changing Healthcare in Kenya</a></h3>
            <a href="blog/ai-healthcare-kenya.html" class="link-more">Read more ${icon("arrow-right")}</a>
          </div>
        </article>
        <article class="media-card reveal">
          <a href="blog/medical-myths.html" class="media-thumb"><div class="img-fallback">Myth-Busting</div><span class="media-tag media-tag--red">Myth-Busting</span></a>
          <div class="media-body">
            <div class="meta"><time datetime="2024-11-10">Nov 10, 2024</time> · 10 min</div>
            <h3><a href="blog/medical-myths.html">7 Medical Myths That Still Harm African Families</a></h3>
            <a href="blog/medical-myths.html" class="link-more">Read more ${icon("arrow-right")}</a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--muted">
    <div class="container">
      <div class="text-center section-head reveal">
        <div class="label-row" style="justify-content:center"><div class="label-line"></div><span class="label">Testimonials</span><div class="label-line"></div></div>
        <h2>What <span class="italic">readers</span> say</h2>
      </div>
      <div class="carousel reveal" aria-roledescription="carousel" aria-label="Reader testimonials">
        <div class="overflow-hidden" style="overflow:hidden">
          <div id="testimonial-track" class="carousel-track">
            <div class="carousel-slide">
              <div class="testimonial">
                <div class="stars" aria-label="5 stars">★★★★★</div>
                <blockquote>“Don't Wait Until You're Sick changed how my family thinks about health. We've shifted from reactive care to preventive living.”</blockquote>
                <div class="testimonial-author"><div class="avatar">AW</div><div class="text-left"><strong>Alice Wanjiku</strong><div class="text-sm muted">Nurse · Nairobi</div></div></div>
              </div>
            </div>
            <div class="carousel-slide">
              <div class="testimonial">
                <div class="stars" aria-label="5 stars">★★★★★</div>
                <blockquote>“The AI-Powered African opened my eyes to opportunities I hadn't considered. Clarity of a teacher, vision of a futurist.”</blockquote>
                <div class="testimonial-author"><div class="avatar">CO</div><div class="text-left"><strong>Chinedu Okafor</strong><div class="text-sm muted">Tech Entrepreneur · Lagos</div></div></div>
              </div>
            </div>
            <div class="carousel-slide">
              <div class="testimonial">
                <div class="stars" aria-label="5 stars">★★★★★</div>
                <blockquote>“I put The Prevention Blueprint in my clinic waiting room. Patients started asking better questions within weeks.”</blockquote>
                <div class="testimonial-author"><div class="avatar">DM</div><div class="text-left"><strong>Dr. David Mutua</strong><div class="text-sm muted">Physician · Mombasa</div></div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="carousel-controls">
          <button type="button" id="prev-testimonial" class="carousel-btn" aria-label="Previous testimonial">${icon("arrow-left")}</button>
          <div class="carousel-dots" id="testimonial-dots" role="tablist">
            <button type="button" class="carousel-dot is-active" aria-label="Slide 1" aria-selected="true"></button>
            <button type="button" class="carousel-dot" aria-label="Slide 2" aria-selected="false"></button>
            <button type="button" class="carousel-dot" aria-label="Slide 3" aria-selected="false"></button>
          </div>
          <button type="button" id="next-testimonial" class="carousel-btn" aria-label="Next testimonial">${icon("arrow-right")}</button>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--navy" id="newsletter-home">
    <div class="container text-center">
      <div class="reveal">
        <div class="card-icon mx-auto" style="background:rgba(200,164,94,0.12);color:var(--gold-400)">${icon("mail")}</div>
        <h2 style="color:#fff" class="mt-6">Join readers learning how to <span class="italic" style="color:var(--gold-400)">live healthier</span></h2>
        <p class="mt-4 mx-auto" style="color:var(--zinc-400);max-width:28rem;font-weight:300">Free health tips, early book access, and practical resources—no spam.</p>
      </div>
      <form id="newsletter-form" class="newsletter-form reveal mt-8" action="https://formsubmit.co/ajax/hello@drkimemia.com" method="POST" data-subject="Newsletter signup — drkimemia.com" data-success="Welcome aboard! Check your inbox soon.">
        <label class="sr-only" for="newsletter-email">Email address</label>
        <input type="email" id="newsletter-email" name="email" required placeholder="Enter your email address" autocomplete="email">
        <input type="hidden" name="_honey" value="" style="display:none">
        <button type="submit" class="btn btn-gold">Subscribe</button>
      </form>
      <div class="perks reveal">
        <span><span class="check">✓</span> Free forever</span>
        <span><span class="check">✓</span> No spam</span>
        <span><span class="check">✓</span> Unsubscribe anytime</span>
      </div>
    </div>
  </section>
`
  )
);

// ABOUT
write(
  "about.html",
  page(
    {
      title: "About — Dr. Edwin Kimemia",
      description: "Biography, mission, vision, and credentials of Dr. Edwin Kimemia — clinician, medical author, and public health educator.",
      root: "",
      page: "about",
      canonical: "https://drkimemia.com/about.html",
    },
    `
  <header class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>About</span></nav>
      <h1 class="reveal">About Dr. <span class="italic gold">Kimemia</span></h1>
      <p class="lead reveal">Clinician. Author. Educator. Building a future where prevention is the first treatment.</p>
    </div>
  </header>
  <section class="section">
    <div class="container">
      <div class="grid lg-grid-12">
        <div class="lg-span-5 reveal">
          <div class="about-image"><div class="img-fallback">Clinical practice</div>
            <div class="quote-overlay">
              <p>“A future where prevention becomes the first treatment.”</p>
              <cite>— Dr. Edwin Kimemia</cite>
            </div>
          </div>
          <div class="stat-grid">
            <div class="stat-box"><strong>15+</strong><span>Years clinical</span></div>
            <div class="stat-box"><strong>4</strong><span>Books</span></div>
            <div class="stat-box"><strong>100+</strong><span>Talks</span></div>
            <div class="stat-box"><strong>50K+</strong><span>Readers</span></div>
          </div>
        </div>
        <div class="lg-span-7 space-y-6">
          <div class="reveal article-body">
            <p>Dr. Edwin Kimemia is a clinician, medical author, and public health educator whose work sits at the intersection of medicine, education, and innovation. With extensive clinical experience across Kenya and East Africa, he has witnessed the cost of preventable disease—and the power of clear knowledge.</p>
            <p>His writing began from a practical frustration: the same conditions recurring not for lack of treatments, but for lack of understanding. He writes to close the gap between medical science and everyday decisions.</p>
            <p>Beyond the page, he is a keynote speaker and advocate for a future where every family has the health knowledge needed to live longer, healthier lives.</p>
          </div>
          <div class="mission-grid reveal">
            <div class="mission-card mission-card--navy"><span class="label">Mission</span><p>To make evidence-based health knowledge accessible to every African family.</p></div>
            <div class="mission-card mission-card--green"><span class="label">Vision</span><p>A future where prevention becomes the first treatment.</p></div>
          </div>
          <div class="reveal mt-8">
            <h3 class="label mb-4">Education & credentials</h3>
            <div class="edu-item"><span class="edu-dot"></span><div><strong>Doctor of Medicine (MD)</strong><div class="text-sm muted">University of Nairobi</div></div></div>
            <div class="edu-item"><span class="edu-dot"></span><div><strong>Master of Public Health (MPH)</strong><div class="text-sm muted">Kenyatta University</div></div></div>
            <div class="edu-item"><span class="edu-dot"></span><div><strong>Certificate in Health Informatics & AI</strong><div class="text-sm muted">Harvard Medical School (Online)</div></div></div>
          </div>
          <div class="reveal mt-8 flex flex-wrap gap-3">
            <a href="books.html" class="btn btn-primary">Explore books</a>
            <a href="speaking.html" class="btn btn-secondary">Speaking topics</a>
            <a href="contact.html" class="btn btn-ghost">Get in touch</a>
          </div>
        </div>
      </div>
    </div>
  </section>
`
  )
);

// BOOKS LIST
write(
  "books.html",
  page(
    {
      title: "Books — Dr. Edwin Kimemia",
      description: "Browse books by Dr. Edwin Kimemia on preventive healthcare, AI in medicine, and healthy living.",
      root: "",
      page: "books",
      canonical: "https://drkimemia.com/books.html",
    },
    `
  <header class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Books</span></nav>
      <h1 class="reveal">Featured <span class="italic gold">Works</span></h1>
      <p class="lead reveal">Evidence-based books written for African families, clinicians, and leaders.</p>
    </div>
  </header>
  <section class="section">
    <div class="container">
      <div class="filters reveal" role="toolbar" aria-label="Filter books">
        <span class="text-xs muted">Filter:</span>
        <button type="button" class="filter-btn is-active" data-filter="all" aria-pressed="true">All</button>
        <button type="button" class="filter-btn" data-filter="health" aria-pressed="false">Health</button>
        <button type="button" class="filter-btn" data-filter="tech" aria-pressed="false">Technology</button>
        <button type="button" class="filter-btn" data-filter="lifestyle" aria-pressed="false">Lifestyle</button>
        <button type="button" class="filter-btn" data-filter="prevention" aria-pressed="false">Prevention</button>
      </div>
      <div class="grid sm-grid-2 lg-grid-4 mt-8">
        ${books.map((b) => bookCard("", b)).join("")}
      </div>
      <div class="banner mt-12 reveal">
        <div>
          <h3>Bulk orders & institutional copies</h3>
          <p class="text-sm muted mt-1">Hospitals, NGOs, schools, and corporates — ask about volume pricing.</p>
        </div>
        <a href="contact.html?subject=Bulk%20book%20order" class="btn btn-primary">Request a quote</a>
      </div>
    </div>
  </section>
`
  )
);

// BOOK DETAIL PAGES
for (const b of books) {
  write(
    `books/${b.slug}.html`,
    page(
      {
        title: `${b.title} — Dr. Edwin Kimemia`,
        description: b.blurb,
        root: "../",
        page: "books/" + b.slug + ".html",
        canonical: `https://drkimemia.com/books/${b.slug}.html`,
        extra: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Book","name":${JSON.stringify(b.title)},"author":{"@type":"Person","name":"Dr. Edwin Kimemia"},"description":${JSON.stringify(b.blurb)},"numberOfPages":"${b.pages}","url":"https://drkimemia.com/books/${b.slug}.html"}
</script>`,
      },
      `
  <header class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a><span>/</span><a href="../books.html">Books</a><span>/</span><span>${b.title}</span></nav>
      <div class="grid lg-grid-2" style="align-items:start;gap:3rem">
        <div class="reveal">
          <div class="book-cover ${b.cover}" style="max-width:22rem">
            <span class="book-tag">${b.tag}</span>
            <div><h1 style="font-size:clamp(1.75rem,3vw,2.25rem);color:inherit">${b.title}</h1><p>${b.blurb}</p></div>
            <div class="book-meta"><span>Dr. Edwin Kimemia</span><span>★ ${b.rating}</span></div>
          </div>
        </div>
        <div class="reveal">
          <span class="chip ${b.chipClass || ""}">${b.chip}</span>
          <h1 class="mt-4" style="font-size:clamp(1.75rem,3vw,2.5rem)">${b.title}</h1>
          <p class="lead mt-4">${b.long}</p>
          <p class="book-price mt-6" style="font-size:1.5rem">${BOOK_PRICE}</p>
          <p class="book-delivery text-sm muted mt-2">${PAY_NOTE}</p>
          <ul class="mt-6 space-y-4" style="list-style:disc;margin-left:1.25rem;color:var(--text-muted);font-weight:300">
            <li>${b.pages} pages · ★ ${b.rating} reader rating (illustrative)</li>
            <li>Pay ${BOOK_PRICE} on this site via M-Pesa STK push</li>
            <li>Or order on WhatsApp — same price and delivery</li>
            <li>Book delivered to your WhatsApp and email after purchase</li>
          </ul>
          <div class="flex flex-wrap gap-3 mt-8">
            <a class="btn btn-primary" href="#buy">Buy on site · ${BOOK_PRICE}</a>
            <a class="btn btn-whatsapp" href="${waLink(waBuyMessage(b.title))}" target="_blank" rel="noopener noreferrer">${icon("whatsapp")} WhatsApp order</a>
            <a class="btn btn-ghost" href="../books.html">All books</a>
          </div>
        </div>
      </div>
    </div>
  </header>
  <section class="section" style="padding-top:0">
    <div class="container" style="max-width:36rem">
      ${purchaseBox("../", { slug: b.slug, title: b.title })}
    </div>
  </section>
  <section class="section">
    <div class="container article">
      <h2 class="reveal">Who this book is for</h2>
      <div class="article-body reveal mt-4">
        <p>Readers who want practical, evidence-informed guidance without medical jargon. Ideal for households, community health workers, students, and clinicians who educate patients every day.</p>
        <p>For bulk or institutional orders, use the contact form and mention the book title.</p>
      </div>
      <div class="related reveal">
        <h3 class="mb-4">More books</h3>
        <div class="flex flex-wrap gap-3">
          ${books
            .filter((x) => x.slug !== b.slug)
            .map((x) => `<a class="btn btn-secondary btn-sm" href="${x.slug}.html">${x.title}</a>`)
            .join("")}
        </div>
      </div>
    </div>
  </section>
`
    )
  );
}

// SPEAKING
write(
  "speaking.html",
  page(
    {
      title: "Speaking — Dr. Edwin Kimemia",
      description: "Book Dr. Edwin Kimemia for keynotes, workshops, and panels on prevention, AI in healthcare, and health leadership.",
      root: "",
      page: "speaking",
      canonical: "https://drkimemia.com/speaking.html",
    },
    `
  <header class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Speaking</span></nav>
      <h1 class="reveal">Keynotes that <span class="italic gold">move</span> audiences to act</h1>
      <p class="lead reveal">Medically rigorous, human, and designed for conferences, corporates, universities, and health systems.</p>
    </div>
  </header>
  <section class="section">
    <div class="container">
      <div class="grid lg-grid-2">
        <div class="space-y-4 reveal">
          <h2>Signature topics</h2>
          <div class="card"><h3>Disease Prevention as a Lifestyle</h3><p class="text-sm muted mt-2">Why prevention beats crisis care—and how to make it stick at home and work.</p></div>
          <div class="card"><h3>AI in African Healthcare</h3><p class="text-sm muted mt-2">Practical opportunities, ethics, and leapfrog paths for systems that cannot wait.</p></div>
          <div class="card"><h3>Medical Entrepreneurship</h3><p class="text-sm muted mt-2">Building health ventures that serve communities and sustain impact.</p></div>
          <div class="card"><h3>The Future of Medicine in Africa</h3><p class="text-sm muted mt-2">A clear-eyed look at where care is headed—and what leaders should do next.</p></div>
          <div class="card"><h3>Youth Empowerment & Health Leadership</h3><p class="text-sm muted mt-2">Equipping the next generation to lead health transformation.</p></div>
        </div>
        <div class="reveal">
          <form id="speaking-form" class="form" action="https://formsubmit.co/ajax/hello@drkimemia.com" method="POST" data-subject="Speaking request — drkimemia.com" data-success="Request received. We'll reply within 48 hours.">
            <h3 class="mb-6">Request a speaking engagement</h3>
            <div class="form-group">
              <label for="sp-name">Full name *</label>
              <input id="sp-name" name="name" required autocomplete="name">
              <p class="form-error">Name is required.</p>
            </div>
            <div class="form-group">
              <label for="sp-email">Email *</label>
              <input id="sp-email" name="email" type="email" required autocomplete="email">
              <p class="form-error">Valid email is required.</p>
            </div>
            <div class="form-group">
              <label for="sp-org">Organization</label>
              <input id="sp-org" name="organization" autocomplete="organization">
            </div>
            <div class="form-group">
              <label for="sp-event">Event details *</label>
              <textarea id="sp-event" name="message" required rows="5" placeholder="Date, location, audience size, topic preference…"></textarea>
              <p class="form-error">Please describe the event.</p>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Submit request</button>
            <p class="form-note">Typical response within 48 hours.</p>
          </form>
        </div>
      </div>
    </div>
  </section>
`
  )
);

// BLOG INDEX
const posts = [
  {
    slug: "prevention-is-better",
    title: "Why Prevention Is Better Than Cure — And Why Systems Stay Reactive",
    date: "2024-12-15",
    dateLabel: "December 15, 2024",
    read: "8 min",
    tag: "Prevention",
    tagClass: "media-tag--green",
    excerpt: "Investing in prevention saves lives and money. So why do many health systems remain overwhelmingly reactive?",
  },
  {
    slug: "ai-healthcare-kenya",
    title: "5 Ways AI Is Already Changing Healthcare in Kenya",
    date: "2024-11-28",
    dateLabel: "November 28, 2024",
    read: "6 min",
    tag: "Technology",
    tagClass: "media-tag--cyan",
    excerpt: "From diagnostics to telemedicine, AI is quietly reshaping how care is delivered.",
  },
  {
    slug: "medical-myths",
    title: "7 Medical Myths That Still Harm African Families",
    date: "2024-11-10",
    dateLabel: "November 10, 2024",
    read: "10 min",
    tag: "Myth-Busting",
    tagClass: "media-tag--red",
    excerpt: "Dangerous myths persist. Here is what evidence actually supports—and what to do instead.",
  },
];

write(
  "blog.html",
  page(
    {
      title: "Blog — Dr. Edwin Kimemia",
      description: "Evidence-based health insights, medical myth-busting, and practical wellness advice.",
      root: "",
      page: "blog",
      canonical: "https://drkimemia.com/blog.html",
    },
    `
  <header class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Blog</span></nav>
      <h1 class="reveal">Latest <span class="italic gold">Insights</span></h1>
      <p class="lead reveal">Evidence-based health writing for families, clinicians, and leaders.</p>
    </div>
  </header>
  <section class="section">
    <div class="container">
      <div class="grid md-grid-3">
        ${posts
          .map(
            (p) => `
        <article class="media-card reveal">
          <a href="blog/${p.slug}.html" class="media-thumb"><div class="img-fallback">${p.tag}</div><span class="media-tag ${p.tagClass}">${p.tag}</span></a>
          <div class="media-body">
            <div class="meta"><time datetime="${p.date}">${p.dateLabel}</time> · ${p.read}</div>
            <h3><a href="blog/${p.slug}.html">${p.title}</a></h3>
            <p>${p.excerpt}</p>
            <a href="blog/${p.slug}.html" class="link-more">Read more ${icon("arrow-right")}</a>
          </div>
        </article>`
          )
          .join("")}
      </div>
    </div>
  </section>
`
  )
);

const articleBodies = {
  "prevention-is-better": `
    <p>Every clinician has seen it: a condition that could have been delayed or avoided with earlier action. Prevention is not a slogan—it is a set of decisions, systems, and habits that compound over time.</p>
    <h2>Why systems stay reactive</h2>
    <p>Reactive care is visible and urgent. Prevention is quieter. Budgets, training, and public attention often follow emergencies, not the slow work of screening, education, and lifestyle support.</p>
    <blockquote>The cheapest ICU bed is the one you never need.</blockquote>
    <h2>What families can do now</h2>
    <ul>
      <li>Know age-appropriate screenings and keep simple records</li>
      <li>Treat blood pressure, glucose, and weight as ongoing metrics—not one-off tests</li>
      <li>Build household rules for sleep, movement, salt, sugar, and tobacco</li>
    </ul>
    <p>Policy and clinics matter—but so does the conversation at the dinner table. Knowledge that families can use is the first layer of a healthier continent.</p>
  `,
  "ai-healthcare-kenya": `
    <p>Artificial intelligence will not replace clinicians. Used well, it can extend scarce expertise, speed decisions, and improve access—especially where specialists are few.</p>
    <h2>Five practical fronts</h2>
    <ol style="margin-left:1.25rem;color:var(--text-muted);font-weight:300;line-height:1.8">
      <li><strong>Diagnostics support</strong> — imaging and triage tools that flag urgency faster.</li>
      <li><strong>Telemedicine triage</strong> — routing patients to the right level of care.</li>
      <li><strong>Supply and logistics</strong> — forecasting stockouts of essential medicines.</li>
      <li><strong>Language access</strong> — translating health education into local languages at scale.</li>
      <li><strong>Training</strong> — simulated cases for students and community workers.</li>
    </ol>
    <h2>Guardrails</h2>
    <p>Data privacy, bias, and accountability are non-negotiable. Tools must be validated in local contexts—not only in high-resource hospitals abroad.</p>
  `,
  "medical-myths": `
    <p>Myths travel faster than evidence. When they shape decisions about malaria, vaccines, cancer, or diet, people pay with health and sometimes with life.</p>
    <h2>Replace myths with actions</h2>
    <ul>
      <li>Seek care early for fever, chest pain, and unexplained weight loss</li>
      <li>Use proven prevention (nets, vaccines, screenings) over unverified remedies as first-line care</li>
      <li>Ask clinicians for plain-language explanations you can repeat at home</li>
    </ul>
    <p>Myth-busting is not about shaming communities—it is about offering clearer, kinder, evidence-based alternatives.</p>
  `,
};

for (const p of posts) {
  write(
    `blog/${p.slug}.html`,
    page(
      {
        title: `${p.title} — Dr. Edwin Kimemia`,
        description: p.excerpt,
        root: "../",
        page: "blog/" + p.slug + ".html",
        canonical: `https://drkimemia.com/blog/${p.slug}.html`,
        extra: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":${JSON.stringify(p.title)},"datePublished":"${p.date}","author":{"@type":"Person","name":"Dr. Edwin Kimemia"},"description":${JSON.stringify(p.excerpt)}}
</script>`,
      },
      `
  <header class="page-header">
    <div class="container article">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a><span>/</span><a href="../blog.html">Blog</a><span>/</span><span>${p.tag}</span></nav>
      <span class="chip">${p.tag}</span>
      <h1 class="reveal mt-4" style="font-size:clamp(1.75rem,3.5vw,2.75rem)">${p.title}</h1>
      <div class="article-meta reveal"><time datetime="${p.date}">${p.dateLabel}</time><span>·</span><span>${p.read} read</span><span>·</span><span>Dr. Edwin Kimemia</span></div>
    </div>
  </header>
  <section class="section" style="padding-top:2rem">
    <div class="container">
      <article class="article article-body reveal">
        ${articleBodies[p.slug]}
      </article>
      <div class="article related reveal">
        <h3 class="mb-4">More articles</h3>
        <div class="flex flex-wrap gap-3">
          ${posts
            .filter((x) => x.slug !== p.slug)
            .map((x) => `<a class="btn btn-secondary btn-sm" href="${x.slug}.html">${x.title}</a>`)
            .join("")}
        </div>
        <a href="../blog.html" class="link-more mt-6">Back to blog ${icon("arrow-right")}</a>
      </div>
    </div>
  </section>
`
    )
  );
}

// CONTACT
write(
  "contact.html",
  page(
    {
      title: "Contact — Dr. Edwin Kimemia",
      description: "Contact Dr. Edwin Kimemia for speaking, partnerships, bulk book orders, and general inquiries.",
      root: "",
      page: "contact",
      canonical: "https://drkimemia.com/contact.html",
    },
    `
  <header class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Contact</span></nav>
      <h1 class="reveal">Let's <span class="italic gold">connect</span></h1>
      <p class="lead reveal">Speaking, bulk orders, partnerships—or a general inquiry.</p>
    </div>
  </header>
  <section class="section">
    <div class="container">
      <div class="grid lg-grid-2">
        <div class="space-y-4 reveal">
          <div class="contact-option">
            <div class="card-icon">${icon("mic")}</div>
            <div><h3>Speaking engagements</h3><p class="text-sm muted mt-1">Keynotes, workshops, panels, conferences.</p></div>
          </div>
          <div class="contact-option">
            <div class="card-icon card-icon--navy">${icon("book")}</div>
            <div><h3>Book orders</h3><p class="text-sm muted mt-1">All books ${BOOK_PRICE}. Pay via M-Pesa STK push; delivered on WhatsApp & email.</p></div>
          </div>
          <div class="contact-option">
            <div class="card-icon card-icon--green">${icon("mail")}</div>
            <div><h3>Partnerships & bulk orders</h3><p class="text-sm muted mt-1">Corporate wellness, clinics, volume book orders.</p></div>
          </div>
          <p class="text-sm muted mt-6">WhatsApp: <a class="gold" href="${waLink(waGeneralMessage())}" target="_blank" rel="noopener noreferrer">${WA_DISPLAY}</a></p>
          <p class="text-sm muted">Email: <a class="gold" href="mailto:hello@drkimemia.com">hello@drkimemia.com</a></p>
        </div>
        <div class="reveal">
          <form id="contact-form" class="form" action="https://formsubmit.co/ajax/hello@drkimemia.com" method="POST" data-subject="Contact form — drkimemia.com" data-success="Message sent. I'll respond within 48 hours.">
            <div class="form-row form-row--2">
              <div class="form-group">
                <label for="c-first">First name *</label>
                <input id="c-first" name="first_name" required autocomplete="given-name">
                <p class="form-error">Required.</p>
              </div>
              <div class="form-group">
                <label for="c-last">Last name *</label>
                <input id="c-last" name="last_name" required autocomplete="family-name">
                <p class="form-error">Required.</p>
              </div>
            </div>
            <div class="form-group">
              <label for="c-email">Email *</label>
              <input id="c-email" name="email" type="email" required autocomplete="email">
              <p class="form-error">Valid email required.</p>
            </div>
            <div class="form-group">
              <label for="c-type">Inquiry type *</label>
              <select id="c-type" name="inquiry_type" required>
                <option value="" disabled selected>Select an option</option>
                <option>Speaking Engagement</option>
                <option>Media / Press Inquiry</option>
                <option>Bulk Book Order</option>
                <option>Corporate Wellness Partnership</option>
                <option>Hospital / Clinic Partnership</option>
                <option>Book Review Request</option>
                <option>General Inquiry</option>
                <option>Other</option>
              </select>
              <p class="form-error">Please select a type.</p>
            </div>
            <div class="form-group">
              <label for="c-message">Message *</label>
              <textarea id="c-message" name="message" required rows="5" placeholder="Tell me about your inquiry…"></textarea>
              <p class="form-error">Message is required.</p>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Send message</button>
            <p class="form-note">Typical response within 48 hours.</p>
          </form>
        </div>
      </div>
    </div>
  </section>
  <section class="section section--navy" id="newsletter">
    <div class="container text-center">
      <h2 style="color:#fff" class="reveal">Newsletter</h2>
      <p class="mt-4 reveal" style="color:var(--zinc-400)">Weekly practical health notes. Unsubscribe anytime.</p>
      <form id="newsletter-form" class="newsletter-form reveal mt-8" action="https://formsubmit.co/ajax/hello@drkimemia.com" method="POST" data-subject="Newsletter signup — drkimemia.com" data-success="You're on the list. Welcome!">
        <label class="sr-only" for="nl2">Email</label>
        <input type="email" id="nl2" name="email" required placeholder="Your email" autocomplete="email">
        <button type="submit" class="btn btn-gold">Subscribe</button>
      </form>
    </div>
  </section>
  <script>
    // Prefill subject from query string
    (function () {
      var params = new URLSearchParams(window.location.search);
      var sub = params.get('subject');
      if (sub) {
        var msg = document.getElementById('c-message');
        var type = document.getElementById('c-type');
        if (msg && !msg.value) msg.value = sub + '\\n\\n';
        if (type && sub.toLowerCase().includes('speak')) type.value = 'Speaking Engagement';
        if (type && sub.toLowerCase().includes('bulk')) type.value = 'Bulk Book Order';
        if (type && sub.toLowerCase().includes('media')) type.value = 'Media / Press Inquiry';
      }
    })();
  </script>
`
  )
);

// LEGAL
function legalPage(file, title, body) {
  write(
    file,
    page(
      {
        title: `${title} — Dr. Edwin Kimemia`,
        description: `${title} for drkimemia.com.`,
        root: "",
        page: file,
        canonical: `https://drkimemia.com/${file}`,
      },
      `
  <header class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>${title}</span></nav>
      <h1 class="reveal">${title}</h1>
      <p class="text-sm muted reveal mt-2">Last updated: July 14, 2026</p>
    </div>
  </header>
  <section class="section" style="padding-top:2rem">
    <div class="container legal reveal">${body}</div>
  </section>
`
    )
  );
}

legalPage(
  "privacy.html",
  "Privacy Policy",
  `
  <p>This site respects your privacy. This policy explains what information may be collected and how it is used.</p>
  <h2>Information we collect</h2>
  <ul>
    <li><strong>Contact & newsletter forms:</strong> name, email, and message content you submit.</li>
    <li><strong>Book orders:</strong> WhatsApp number, phone for M-Pesa STK push, and email for delivery after purchase.</li>
    <li><strong>Technical data:</strong> basic server or analytics logs (if enabled), such as browser type and pages visited.</li>
  </ul>
  <h2>How we use information</h2>
  <p>To respond to inquiries, process book orders (M-Pesa STK push payment and digital delivery via WhatsApp and email), send newsletters you opted into, improve the website, and meet legal obligations.</p>
  <h2>Third parties</h2>
  <p>Form submissions may be processed by FormSubmit or a similar form provider. Fonts may load from Google Fonts. Replace these providers with your own stack when you go live if required by your compliance needs.</p>
  <h2>Your rights</h2>
  <p>You may request access, correction, or deletion of personal data we hold by emailing <a href="mailto:hello@drkimemia.com">hello@drkimemia.com</a>.</p>
  <h2>Contact</h2>
  <p>Questions about this policy: <a href="mailto:hello@drkimemia.com">hello@drkimemia.com</a>.</p>
`
);

legalPage(
  "terms.html",
  "Terms of Service",
  `
  <p>By using drkimemia.com you agree to these terms.</p>
  <h2>Educational purpose</h2>
  <p>Content on this site is for general education and does not create a doctor–patient relationship. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider with questions about a medical condition.</p>
  <h2>Book purchases</h2>
  <p>Digital books are priced at ${BOOK_PRICE} each. You may pay on this website via M-Pesa STK push, or order on WhatsApp (${WA_DISPLAY}). After successful payment, the book is delivered to your WhatsApp number and email address.</p>
  <h2>Intellectual property</h2>
  <p>Books, text, branding, and site design are owned by Dr. Edwin Kimemia or respective rights holders. You may not copy or redistribute content for commercial use without permission.</p>
  <h2>Limitation of liability</h2>
  <p>To the fullest extent permitted by law, we are not liable for decisions made solely on the basis of website content.</p>
  <h2>Changes</h2>
  <p>We may update these terms. Continued use of the site after changes constitutes acceptance.</p>
`
);

legalPage(
  "cookies.html",
  "Cookie Policy",
  `
  <p>This site aims to minimize tracking. The site uses a dark theme only; no theme preference is stored.</p>
  <h2>Essential storage</h2>
  <ul>
    <li>No essential cookies or localStorage are required for browsing the site.</li>
  </ul>
  <h2>Third-party cookies</h2>
  <p>If analytics, ads, or embedded media are added later, this policy will list them. Google Fonts may process connection data when fonts load. WhatsApp and M-Pesa are used off-site for book orders.</p>
  <h2>Your choices</h2>
  <p>You can clear site data in your browser settings at any time.</p>
`
);

// README
fs.writeFileSync(
  path.join(root, "README.md"),
  `# Dr. Edwin Kimemia — Website

Static multi-page site (dark theme only) with a Node.js M-Pesa STK checkout API.

## Run (recommended)

\`\`\`bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm start
\`\`\`

Open http://localhost:3000

Without Daraja keys, checkout runs in **mock mode** (UI + order flow still work).

## Rebuild pages

After editing \`build-pages.mjs\`:

\`\`\`bash
npm run build:pages
\`\`\`

## Book sales

- All books: **KES 499**
- **Pay on site** — M-Pesa STK push (\`POST /api/checkout\`)
- **Or WhatsApp** — +254 715 135 141
- After payment: delivered on **WhatsApp and email**

### M-Pesa setup (live / sandbox)

1. Create an app on [Safaricom Daraja](https://developer.safaricom.co.ke)
2. Put Consumer Key, Secret, Passkey, Shortcode in \`.env\`
3. Set \`PUBLIC_URL\` / \`MPESA_CALLBACK_URL\` to a **public HTTPS** URL  
   (use [ngrok](https://ngrok.com) when testing locally)
4. Set \`MPESA_ENV=sandbox\` or \`production\`
5. Optional SMTP vars for purchase emails

### API

| Method | Path | Purpose |
|--------|------|---------|
| POST | \`/api/checkout\` | Start STK (body: bookSlug, phone, email, name?) |
| GET | \`/api/orders/:id\` | Poll payment status |
| POST | \`/api/mpesa/callback\` | Safaricom STK callback |
| GET | \`/api/books\` | Catalog + price |
| GET | \`/api/health\` | Health + mock flag |

## Contact forms

Forms still post via [FormSubmit](https://formsubmit.co) to \`hello@drkimemia.com\`.

## Performance notes

- Shared \`css/main.css\` + \`js/main.js\`
- Floating WhatsApp button site-wide
- Express serves static files + API on one port
`,
  "utf8"
);

console.log("Done.");
