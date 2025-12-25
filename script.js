
/* =========================
   Utilities
========================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* =========================
   Scroll progress (within .snap)
========================= */
const scroller = $(".snap");
const progressBar = $(".progress__bar");

function updateProgress() {
  const max = scroller.scrollHeight - scroller.clientHeight;
  const p = max > 0 ? (scroller.scrollTop / max) : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, p * 100))}%`;
}
scroller.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* =========================
   Reveal on enter (re-trigger per panel)
   -> effet Apple : à chaque “écran”, les éléments se reconstruisent.
========================= */
const revealEls = $$(".reveal");
const panels = $$("[data-panel]");

// Observe panels: when a panel becomes active, reset and re-run reveals inside it
const panelObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const inside = $$(".reveal", e.target);
      // Reset
      inside.forEach(el => el.classList.remove("is-in"));
      // Stagger in
      inside.forEach((el, i) => {
        const delay = 60 + i * 85;
        el.style.transitionDelay = `${delay}ms`;
        // next frame
        requestAnimationFrame(() => el.classList.add("is-in"));
      });
    }
  });
}, {
  root: scroller,
  threshold: 0.55
});

panels.forEach(p => panelObserver.observe(p));

/* =========================
   Micro parallax (subtle, premium)
========================= */
const parallaxEls = $$("[data-parallax]");
function parallaxTick() {
  const y = scroller.scrollTop;
  parallaxEls.forEach(el => {
    const factor = parseFloat(el.dataset.parallax || "0.15");
    const r = el.getBoundingClientRect();
    // relative to viewport center
    const center = (r.top + r.height / 2) - (window.innerHeight / 2);
    const t = (center * factor) * -0.12;
    el.style.transform = `translate3d(0, ${t}px, 0)`;
  });
}
scroller.addEventListener("scroll", () => requestAnimationFrame(parallaxTick), { passive: true });
window.addEventListener("resize", () => requestAnimationFrame(parallaxTick));
parallaxTick();

/* =========================
   Soft tilt on hover (desktop only)
========================= */
const tiltCards = $$("[data-tilt]");
tiltCards.forEach(card => {
  let raf = null;
  const max = 7;

  const onMove = (ev) => {
    const rect = card.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width;
    const y = (ev.clientY - rect.top) / rect.height;
    const rx = (y - 0.5) * -max;
    const ry = (x - 0.5) * max;

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
  };

  const onLeave = () => {
    if (raf) cancelAnimationFrame(raf);
    card.style.transform = `translateY(0)`;
  };

  // Avoid on touch devices
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (finePointer) {
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
  }
});

/* =========================
   Mobile menu drawer
========================= */
const toggleBtn = $(".nav__toggle");
const drawer = $(".drawer");
const drawerPanel = $(".drawer__panel");

function openDrawer() {
  drawer.classList.add("is-open");
  toggleBtn.setAttribute("aria-expanded", "true");
  drawer.setAttribute("aria-hidden", "false");
}
function closeDrawer() {
  drawer.classList.remove("is-open");
  toggleBtn.setAttribute("aria-expanded", "false");
  drawer.setAttribute("aria-hidden", "true");
}

toggleBtn.addEventListener("click", () => {
  drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
});

drawer.addEventListener("click", (e) => {
  if (e.target === drawer) closeDrawer();
});

$$("a", drawerPanel).forEach(a => {
  a.addEventListener("click", () => closeDrawer());
});

/* =========================
   Copy email button
========================= */
const copyEmailBtn = $("#copyEmail");
copyEmailBtn?.addEventListener("click", async () => {
  const email = "contact@lysis.audio";
  try {
    await navigator.clipboard.writeText(email);
    copyEmailBtn.textContent = "Email copié ✔";
    setTimeout(() => {
      copyEmailBtn.innerHTML = `Copier l’email de contact <span class="btn__icon">⎘</span>`;
    }, 1400);
  } catch {
    // Fallback
    window.location.href = `mailto:${email}`;
  }
});

/* =========================
   Ensure snap feels good on iOS
========================= */
scroller.style.webkitOverflowScrolling = "touch";
