import introLogoUrl from "./assets/logo-horizonte-transparent.png";

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");

const mountIntro = () => {
  const root = document.documentElement;
  if (!root.classList.contains("intro-active")) return;

  const duration = 2550;
  let overlay;
  let done = false;
  const timers = [];

  const releasePage = () => root.classList.remove("intro-active", "intro-leaving");
  const cleanup = () => {
    timers.forEach(window.clearTimeout);
    document.removeEventListener("keydown", onKey, true);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    document.removeEventListener("wheel", onGesture, true);
    document.removeEventListener("touchstart", onGesture, true);
    document.removeEventListener("pointerdown", onGesture, true);
    window.removeEventListener("scroll", onGesture);
  };
  const finish = (natural = false) => {
    if (done) return;
    done = true;
    cleanup();
    try { sessionStorage.setItem("horizonte-intro", "1"); } catch (error) {}

    root.classList.add("intro-leaving");
    root.classList.remove("intro-active");

    if (!overlay) {
      releasePage();
      return;
    }

    overlay.classList.add("is-leaving");
    if (!natural) overlay.classList.add("is-skipped");
    window.setTimeout(() => overlay.remove(), natural ? 580 : 290);
    window.setTimeout(releasePage, natural ? 620 : 310);
  };
  const scrollingKeys = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "End", "Home"]);
  function onKey(event) {
    if (scrollingKeys.has(event.key)) event.preventDefault();
    if (scrollingKeys.has(event.key) || event.key === "Escape" || event.key === "Tab") finish();
  }
  function onVisibilityChange() {
    if (document.hidden) finish();
  }
  function onGesture(event) {
    if (event.type === "pointerdown" && event.pointerType === "touch") return;
    if (event.cancelable && (event.type === "wheel" || event.type === "touchstart")) event.preventDefault();
    finish();
  }

  const animatedLetters = (text, className) => [...text]
    .map((character, index) => `<span class="intro-letter ${className}" style="--letter-index:${index}">${character === " " ? "&nbsp;" : character}</span>`)
    .join("");

  try {
    if (performance.now() > 3000 || window.pageYOffset > 0) throw new Error("intro mounted too late");

    overlay = document.createElement("div");
    overlay.className = "intro";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="intro-stage">
        <div class="intro-mark">
          <img src="${introLogoUrl}" alt="" width="1044" height="770" />
          <span class="intro-glint"></span>
        </div>
        <div class="intro-signature">
          <strong aria-label="Instituto Educacional">${animatedLetters("Instituto Educacional", "intro-letter-primary")}</strong>
          <span class="intro-wordmark" aria-label="Horizonte">${animatedLetters("Horizonte", "intro-letter-gold")}</span>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    document.addEventListener("keydown", onKey, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("wheel", onGesture, { capture: true, passive: false });
    document.addEventListener("touchstart", onGesture, { capture: true, passive: false });
    document.addEventListener("pointerdown", onGesture, true);
    window.addEventListener("scroll", onGesture, { passive: true });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (done) return;
        overlay.classList.add("is-playing");
        timers.push(window.setTimeout(() => finish(true), duration));
      });
    });
    timers.push(window.setTimeout(() => {
      if (!overlay.classList.contains("is-playing")) finish();
    }, 1500));
    timers.push(window.setTimeout(() => finish(), duration + 2000));
  } catch (error) {
    finish();
  }
};

mountIntro();

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
};

const closeMenu = () => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.querySelector(".sr-only").textContent = "Abrir menu";
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
};

menuButton.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.querySelector(".sr-only").textContent = willOpen ? "Fechar menu" : "Abrir menu";
  navigation.classList.toggle("open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetSelector = link.getAttribute("href");
    const target = targetSelector?.startsWith("#")
      ? document.querySelector(targetSelector)
      : null;
    const wasMenuOpen = document.body.classList.contains("menu-open");

    closeMenu();

    // On mobile, unlock the page before calculating the anchor position.
    // Otherwise some browsers start the smooth scroll while body is still
    // overflow-hidden and stop above the requested section.
    if (wasMenuOpen && target) {
      event.preventDefault();
      requestAnimationFrame(() => {
        const scrollTarget = targetSelector === "#contato"
          ? target.querySelector(".contact-copy .eyebrow")
          : target;

        if (targetSelector === "#contato" && scrollTarget) {
          const headerHeight = header.getBoundingClientRect().height;
          const top = window.scrollY + scrollTarget.getBoundingClientRect().top - headerHeight - 20;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        } else {
          scrollTarget.scrollIntoView({ block: "start" });
        }
        window.history.replaceState(null, "", targetSelector);
      });
    }
  });
});
document.addEventListener("click", (event) => {
  if (!document.body.classList.contains("menu-open")) return;
  if (navigation.contains(event.target) || menuButton.contains(event.target)) return;
  closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const trackedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const navObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    sectionLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  },
  { rootMargin: "-24% 0px -60%", threshold: [0, 0.2, 0.5] },
);

trackedSections.forEach((section) => navObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
document.querySelector("[data-year]").textContent = new Date().getFullYear();
