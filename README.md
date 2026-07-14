# Dr. Edwin Kimemia — Website

Static multi-page site. Fast by design: no Tailwind CDN, no Lenis, no GSAP.

## Run locally

Open `index.html` in a browser, or:

```bash
npx serve .
```

## Rebuild pages

After editing `build-pages.mjs`:

```bash
node build-pages.mjs
```

## Configure forms

Forms post via [FormSubmit](https://formsubmit.co) to `hello@drkimemia.com`.  
Confirm the email once in your inbox, or change the address in:

- `build-pages.mjs` form actions
- `js/main.js` → `SITE.formEmail`

## Replace placeholders

- Social profile URLs in nav/footer
- Portrait images (currently CSS fallbacks)
- Real buy links / store URLs on book pages
- PDF files for resource downloads

## Performance notes

- Shared `css/main.css` + `js/main.js` only
- Inline SVG icons (no icon CDN)
- IntersectionObserver reveals (respects reduced motion)
- Single rAF-throttled scroll handler
