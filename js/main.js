/**
 * Dr. Edwin Kimemia — shared site scripts
 * Lightweight: no Lenis, no GSAP. Native scroll + IntersectionObserver.
 */
(function () {
  "use strict";

  const SITE = {
    // Replace with your real inbox for FormSubmit delivery
    formEmail: "hello@drkimemia.com",
    year: new Date().getFullYear(),
  };

  const SEARCH_INDEX = [
    {
      title: "Don't Wait Until You're Sick",
      type: "Book · Preventive Healthcare",
      url: "books/dont-wait.html",
      keywords: "prevention health book sick family",
    },
    {
      title: "The AI-Powered African",
      type: "Book · Technology & Health",
      url: "books/ai-powered-african.html",
      keywords: "ai technology artificial intelligence africa",
    },
    {
      title: "The Prevention Blueprint",
      type: "Book · Prevention",
      url: "books/prevention-blueprint.html",
      keywords: "prevention blueprint guide disease",
    },
    {
      title: "Healthy Living Simplified",
      type: "Book · Wellness",
      url: "books/healthy-living.html",
      keywords: "wellness lifestyle healthy living",
    },
    {
      title: "Why Prevention Is Better Than Cure",
      type: "Article · Prevention",
      url: "blog/prevention-is-better.html",
      keywords: "prevention cure africa health systems",
    },
    {
      title: "5 Ways AI Is Changing Healthcare in Kenya",
      type: "Article · Technology",
      url: "blog/ai-healthcare-kenya.html",
      keywords: "ai kenya healthcare telemedicine",
    },
    {
      title: "7 Medical Myths Still Harming Africans",
      type: "Article · Myth-Busting",
      url: "blog/medical-myths.html",
      keywords: "myths malaria cancer medicine",
    },
    {
      title: "Book Dr. Kimemia to Speak",
      type: "Speaking · Keynotes & Workshops",
      url: "speaking.html",
      keywords: "speak keynote conference workshop",
    },
    {
      title: "Contact & Partnerships",
      type: "Contact",
      url: "contact.html",
      keywords: "contact partnership bulk order whatsapp mpesa",
    },
    {
      title: "About Dr. Edwin Kimemia",
      type: "About",
      url: "about.html",
      keywords: "clinician author educator biography",
    },
  ];

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  // ---- Year ----
  qsa("[data-year]").forEach((el) => {
    el.textContent = String(SITE.year);
  });

  // ---- Reading progress + back-to-top (single rAF scroll handler) ----
  const progress = qs("#reading-progress");
  const backTop = qs("#back-to-top");
  let scrollPending = false;

  function onScroll() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      scrollPending = false;
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      if (progress && height > 0) {
        progress.style.width = Math.min(100, (scrollTop / height) * 100) + "%";
      }
      if (backTop) {
        const show = scrollTop > 500;
        backTop.classList.toggle("is-visible", show);
      }
      const nav = qs("#main-nav");
      if (nav) nav.classList.toggle("is-scrolled", scrollTop > 40);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ---- Reveal on scroll ----
  const reveals = qsa(".reveal");
  if (reveals.length && !prefersReducedMotion() && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // ---- Counters ----
  const counters = qsa("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-count"), 10) || 0;
          animateCount(el, target);
          cio.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => cio.observe(c));
  }

  function animateCount(el, target) {
    if (prefersReducedMotion()) {
      el.textContent = formatCount(target, target);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(target * eased);
      el.textContent = formatCount(val, target);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function formatCount(val, target) {
    if (target >= 1000) {
      const k = val / 1000;
      return (val >= target ? Math.round(k) : k.toFixed(k >= 10 ? 0 : 1)) + "K+";
    }
    if (target === 100) return val + "+";
    return String(val);
  }

  // Dark theme only — no theme toggle

  // ---- Mobile menu ----
  // Note: #mobile-menu uses the HTML `hidden` attribute. Browsers map that to
  // display:none !important, so we must clear it when opening — class alone is not enough.
  const menuToggle = qs("#menu-toggle");
  const mobileMenu = qs("#mobile-menu");
  let menuOpen = false;
  let menuCloseTimer = null;

  function setMenuIcons(open) {
    const closeIcon = qs("#menu-icon-close");
    const openIcon = qs("#menu-icon-open");
    if (openIcon) openIcon.classList.toggle("hidden", open);
    if (closeIcon) closeIcon.classList.toggle("hidden", !open);
  }

  function openMenu() {
    if (!mobileMenu || !menuToggle) return;
    if (menuCloseTimer) {
      clearTimeout(menuCloseTimer);
      menuCloseTimer = null;
    }
    menuOpen = true;
    mobileMenu.hidden = false;
    mobileMenu.setAttribute("aria-hidden", "false");
    // Allow one frame so the slide-in transition runs after un-hiding
    requestAnimationFrame(() => {
      if (menuOpen) mobileMenu.classList.add("is-open");
    });
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
    setMenuIcons(true);
  }

  function closeMenu() {
    if (!mobileMenu || !menuToggle) return;
    if (!menuOpen && mobileMenu.hidden) return;
    menuOpen = false;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
    setMenuIcons(false);
    // Keep in DOM until slide-out finishes, then re-apply hidden
    if (menuCloseTimer) clearTimeout(menuCloseTimer);
    menuCloseTimer = setTimeout(() => {
      menuCloseTimer = null;
      if (!menuOpen) mobileMenu.hidden = true;
    }, 360);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (menuOpen) closeMenu();
      else openMenu();
    });
  }

  // Tap backdrop area (the overlay itself, not the panel) to close
  if (mobileMenu) {
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
  }

  qsa(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  // ---- Search modal ----
  const searchBtn = qs("#search-btn");
  const searchModal = qs("#search-modal");
  const searchClose = qs("#search-close");
  const searchInput = qs("#search-input");
  const searchResults = qs("#search-results");
  let lastFocus = null;

  function openSearch() {
    if (!searchModal) return;
    lastFocus = document.activeElement;
    searchModal.classList.add("is-open");
    searchModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => searchInput && searchInput.focus(), 50);
    renderSearch("");
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove("is-open");
    searchModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (searchInput) searchInput.value = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (searchBtn) searchBtn.addEventListener("click", openSearch);
  if (searchClose) searchClose.addEventListener("click", closeSearch);

  if (searchModal) {
    searchModal.addEventListener("click", (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  function renderSearch(query) {
    if (!searchResults) return;
    const q = query.trim().toLowerCase();
    const root = document.documentElement.getAttribute("data-root") || "";
    let items = SEARCH_INDEX;
    if (q) {
      items = SEARCH_INDEX.filter((item) => {
        const hay = (item.title + " " + item.type + " " + item.keywords).toLowerCase();
        return hay.includes(q);
      });
    }
    if (!items.length) {
      searchResults.innerHTML = '<p class="search-empty">No results for "' + escapeHtml(query) + '".</p>';
      return;
    }
    const heading = q ? "Results" : "Quick Links";
    searchResults.innerHTML =
      "<h4>" +
      heading +
      "</h4>" +
      items
        .map(
          (item) =>
            '<a class="search-result" href="' +
            escapeAttr(root + item.url) +
            '"><div><strong>' +
            escapeHtml(item.title) +
            "</strong><span>" +
            escapeHtml(item.type) +
            "</span></div></a>"
        )
        .join("");
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => renderSearch(searchInput.value));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  // ---- Keyboard ----
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSearch();
      closeMenu();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (searchModal && searchModal.classList.contains("is-open")) closeSearch();
      else openSearch();
    }
  });

  // ---- Safe anchor handling ----
  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") {
        e.preventDefault();
        return;
      }
      const id = href.slice(1);
      if (!id) {
        e.preventDefault();
        return;
      }
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
        closeMenu();
        closeSearch();
      }
    });
  });

  // ---- Book filters ----
  const filterBtns = qsa(".filter-btn");
  const bookCards = qsa("[data-category]");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      const filter = btn.getAttribute("data-filter") || "all";
      bookCards.forEach((card) => {
        const cat = card.getAttribute("data-category") || "";
        const show = filter === "all" || cat.split(/\s+/).includes(filter);
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  // ---- Testimonial carousel ----
  const track = qs("#testimonial-track");
  if (track) {
    const slides = qsa(".carousel-slide", track);
    const dots = qsa("#testimonial-dots button");
    const prev = qs("#prev-testimonial");
    const next = qs("#next-testimonial");
    let index = 0;
    let timer = null;
    const total = slides.length;

    function goTo(i) {
      index = ((i % total) + total) % total;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach((d, di) => {
        d.classList.toggle("is-active", di === index);
        d.setAttribute("aria-selected", di === index ? "true" : "false");
      });
    }

    function startAuto() {
      if (prefersReducedMotion() || total < 2) return;
      stopAuto();
      timer = setInterval(() => goTo(index + 1), 7000);
    }

    function stopAuto() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    if (prev) prev.addEventListener("click", () => { goTo(index - 1); startAuto(); });
    if (next) next.addEventListener("click", () => { goTo(index + 1); startAuto(); });
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => { goTo(i); startAuto(); });
    });

    const carousel = track.closest(".carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", stopAuto);
      carousel.addEventListener("mouseleave", startAuto);
      carousel.addEventListener("focusin", stopAuto);
      carousel.addEventListener("focusout", startAuto);
    }

    goTo(0);
    startAuto();
  }

  // ---- Toast ----
  let toastTimer = null;
  function showToast(message) {
    const toast = qs("#toast");
    const msg = qs("#toast-message");
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.classList.add("is-show");
    toast.setAttribute("role", "status");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 4000);
  }

  window.showToast = showToast;

  // ---- Forms (FormSubmit.co) ----
  function wireForm(form) {
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFormErrors(form);

      if (!form.checkValidity()) {
        markInvalid(form);
        showToast("Please fill in all required fields correctly.");
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      const original = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      const formData = new FormData(form);
      formData.append("_subject", form.getAttribute("data-subject") || "Website inquiry — drkimemia.com");
      formData.append("_template", "table");
      formData.append("_captcha", "false");

      const endpoint = form.getAttribute("action") || "https://formsubmit.co/ajax/" + SITE.formEmail;

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          form.reset();
          showToast(form.getAttribute("data-success") || "Message sent. Thank you!");
        } else {
          // Fallback: open mailto so the user can still reach out
          openMailtoFallback(form);
          showToast("Opened your email app as a backup. Please send from there.");
        }
      } catch (err) {
        openMailtoFallback(form);
        showToast("Opened your email app as a backup. Please send from there.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        }
      }
    });
  }

  function clearFormErrors(form) {
    qsa(".form-group", form).forEach((g) => g.classList.remove("has-error"));
  }

  function markInvalid(form) {
    qsa("input, select, textarea", form).forEach((field) => {
      const group = field.closest(".form-group");
      if (group && !field.checkValidity()) group.classList.add("has-error");
    });
  }

  function openMailtoFallback(form) {
    const data = new FormData(form);
    const lines = [];
    data.forEach((value, key) => {
      if (key.startsWith("_")) return;
      lines.push(key + ": " + value);
    });
    const subject = encodeURIComponent(form.getAttribute("data-subject") || "Website inquiry");
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = "mailto:" + SITE.formEmail + "?subject=" + subject + "&body=" + body;
  }

  wireForm(qs("#contact-form"));
  wireForm(qs("#newsletter-form"));
  wireForm(qs("#speaking-form"));

  // ---- M-Pesa checkout (on-site STK) ----
  const API_BASE = ""; // same origin when using `npm start`

  function setCheckoutStatus(el, state, message) {
    if (!el) return;
    el.hidden = !message;
    el.className = "checkout-status" + (state ? " is-" + state : "");
    el.textContent = message || "";
  }

  async function pollOrder(orderId, statusEl, attempts) {
    const max = attempts || 40;
    for (let i = 0; i < max; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch(API_BASE + "/api/orders/" + encodeURIComponent(orderId));
        const data = await res.json();
        if (!data.ok || !data.order) continue;
        const st = data.order.status;
        if (st === "paid") {
          setCheckoutStatus(
            statusEl,
            "success",
            "Payment received" +
              (data.order.mpesaReceiptNumber ? " · Receipt " + data.order.mpesaReceiptNumber : "") +
              ". Your book will be delivered on WhatsApp and email shortly."
          );
          showToast("Payment successful. Check WhatsApp and email for your book.");
          return true;
        }
        if (st === "failed") {
          setCheckoutStatus(
            statusEl,
            "error",
            data.order.resultDesc || "Payment was cancelled or failed. You can try again or order on WhatsApp."
          );
          return false;
        }
        setCheckoutStatus(statusEl, "pending", "Waiting for M-Pesa confirmation… (" + (i + 1) + ")");
      } catch (_) {
        /* keep polling */
      }
    }
    setCheckoutStatus(
      statusEl,
      "pending",
      "Still waiting for confirmation. If you paid, keep this page open or contact WhatsApp +254 715 135 141 with your receipt."
    );
    return false;
  }

  qsa("[data-checkout-form]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFormErrors(form);
      if (!form.checkValidity()) {
        markInvalid(form);
        showToast("Enter a valid M-Pesa phone and delivery email.");
        return;
      }

      const box = form.closest(".purchase-box");
      const statusEl =
        (box && box.querySelector(".checkout-status")) ||
        form.querySelector(".checkout-status");
      const submitBtn = form.querySelector('[type="submit"]');
      const original = submitBtn ? submitBtn.textContent : "";

      const payload = {
        bookSlug: form.bookSlug ? form.bookSlug.value : form.querySelector('[name="bookSlug"]')?.value,
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        name: form.name ? form.name.value.trim() : "",
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending STK…";
      }
      setCheckoutStatus(statusEl, "pending", "Sending M-Pesa STK push to your phone…");

      try {
        const res = await fetch(API_BASE + "/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          setCheckoutStatus(statusEl, "error", data.error || "Could not start payment. Try WhatsApp order instead.");
          showToast(data.error || "Checkout failed.");
          return;
        }

        setCheckoutStatus(
          statusEl,
          "pending",
          (data.message || "Check your phone for the M-Pesa prompt.") +
            (data.mock ? " (Demo mode — payment will complete automatically in a few seconds.)" : "")
        );
        showToast(data.mock ? "Demo STK started…" : "Enter your M-Pesa PIN on your phone.");

        await pollOrder(data.orderId, statusEl);
        if (statusEl && statusEl.classList.contains("is-success")) {
          form.reset();
        }
      } catch (err) {
        setCheckoutStatus(
          statusEl,
          "error",
          "Cannot reach the payment server. Run the site with npm start, or buy via WhatsApp."
        );
        showToast("Payment server unavailable. Use WhatsApp to order.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        }
      }
    });
  });

  // ---- Image error fallbacks ----
  qsa("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      const label = img.getAttribute("alt") || "Image";
      const wrap = document.createElement("div");
      wrap.className = "img-fallback";
      wrap.textContent = label;
      if (img.parentNode) img.parentNode.replaceChild(wrap, img);
    });
  });

  // ---- Active nav by page ----
  const page = document.documentElement.getAttribute("data-page") || "";
  if (page) {
    qsa(".nav-link[data-nav], .mobile-nav-link[data-nav]").forEach((link) => {
      if (link.getAttribute("data-nav") === page) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }
})();
