"use strict";

// ----- OOP: Site Navigation Controller -----
class SiteNav {
  constructor(opts = {}) {
    this.menuBtn = document.getElementById(opts.menuBtnId || "menu-btn");
    this.mobileMenu = document.getElementById(opts.mobileMenuId || "mobile-menu");
    this.overlay = document.getElementById(opts.overlayId || "menu-overlay");
    this.sections = opts.sections || ["hero", "work", "skills", "contact"];
    this.navSelector = opts.navSelector || 'nav a[href^="#"], #mobile-menu a[href^="#"]';
    this.navLinks = document.querySelectorAll(this.navSelector);
    this._scrollRaf = null;
  }

  init() {
    this.bindMenuToggle();
    this.bindSmoothScroll();
    this.bindActiveSectionHighlight();
  }

  bindMenuToggle() {
    if (!this.menuBtn || !this.mobileMenu) return;
    this.menuBtn.addEventListener("click", () => {
      this.mobileMenu.classList.toggle("hidden");
      this.overlay?.classList.toggle("hidden");
      this.menuBtn.setAttribute("aria-expanded", String(!this.mobileMenu.classList.contains("hidden")));
    });

    // Close when tapping outside
    this.overlay?.addEventListener("click", () => {
      if (!this.mobileMenu.classList.contains("hidden")) {
        this.mobileMenu.classList.add("hidden");
        this.overlay.classList.add("hidden");
        this.menuBtn?.setAttribute("aria-expanded", "false");
      }
    });
  }

  bindSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        const targetId = href ? href.slice(1) : "";
        if (!targetId) return;
        const target = document.getElementById(targetId);

        if (targetId === "about") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (this.mobileMenu && !this.mobileMenu.classList.contains("hidden")) {
            this.mobileMenu.classList.add("hidden");
            this.overlay?.classList.add("hidden");
            this.menuBtn?.setAttribute("aria-expanded", "false");
          }
          return;
        }

        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          if (this.mobileMenu && !this.mobileMenu.classList.contains("hidden")) {
            this.mobileMenu.classList.add("hidden");
            this.overlay?.classList.add("hidden");
            this.menuBtn?.setAttribute("aria-expanded", "false");
          }
        }
      });
    });
  }

  bindActiveSectionHighlight() {
    const onScroll = () => {
      if (this._scrollRaf) return;
      this._scrollRaf = requestAnimationFrame(() => {
        this.activateNavLink();
        this._scrollRaf = null;
      });
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("load", () => this.activateNavLink());
  }

  activateNavLink() {
    let index = this.sections.length;
    while (--index >= 0) {
      const section = document.getElementById(this.sections[index]);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          this.navLinks.forEach(link => {
            link.classList.remove("nav-active");
            link.removeAttribute("aria-current");
            if (link.getAttribute("href") === "#" + this.sections[index]) {
              link.classList.add("nav-active");
              link.setAttribute("aria-current", "page");
            }
          });
          break;
        }
      }
    }
  }
}

// ----- OOP: Projects Slider -----
class ProjectsSlider {
  constructor(opts = {}) {
    this.track = document.getElementById(opts.trackId || "projects-track");
    this.prevBtn = document.getElementById(opts.prevBtnId || "proj-prev");
    this.nextBtn = document.getElementById(opts.nextBtnId || "proj-next");
    this.dotsWrap = document.getElementById(opts.dotsId || "projects-dots");
    this.autoplayMs = typeof opts.autoplayMs === 'number' ? opts.autoplayMs : 5000; // default 5s
    this.cards = [];
    this.dots = [];
    this.current = 0;
    this.autoTimer = null;
    this.raf = null;
    this.projects = [];
  }

  setProjects(list) {
    this.projects = Array.isArray(list) ? list.slice() : [];
    return this;
  }

  render() {
    if (!this.track) return this;
    this.track.innerHTML = "";
    this.projects.forEach(p => {
      const article = document.createElement("article");
      article.className = "bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-white transition-shadow";
      article.innerHTML = `
        <img src="${p.image}" alt="${p.title}" class="w-full object-cover h-40 sm:h-48 md:h-56" width="600" height="400" loading="lazy" decoding="async" />
        <div class="p-4 sm:p-6">
          <h3 class="font-bold text-lg sm:text-xl mb-2 leading-snug">${p.title}</h3>
          <p class="text-gray-400 text-sm mb-3 proj-desc">${p.description}</p>
          ${Array.isArray(p.tech) && p.tech.length ? `
            <div class=\"flex flex-wrap gap-2\">
              ${p.tech.map(t => `<span class=\"px-2 py-0.5 rounded-full bg-gray-800 text-xs\">${t}</span>`).join("")}
            </div>` : ""}
          ${(p.github && p.github !== "#") || (p.demo && p.demo !== "#") ? `
            <div class=\"mt-4 flex gap-4 text-sm\">
              ${p.github && p.github !== "#" ? `<a class=\"text-indigo-400 hover:text-indigo-300\" href=\"${p.github}\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub</a>` : ""}
              ${p.demo && p.demo !== "#" ? `<a class=\"text-indigo-400 hover:text-indigo-300\" href=\"${p.demo}\" target=\"_blank\" rel=\"noopener noreferrer\">Live</a>` : ""}
            </div>` : ""}
        </div>
      `;
      this.track.appendChild(article);
    });

    // collect cards & apply sizing/snap
    this.cards = Array.from(this.track.querySelectorAll("article"));
    this.cards.forEach(card => {
      card.classList.add("snap-start", "min-w-[85%]", "sm:min-w-[60%]", "md:min-w-[48%]", "lg:min-w-[32%]");
    });

    this.setupDots();
    this.updateButtonsVisibility();
    return this;
  }

  setupDots() {
    if (!this.dotsWrap) return;
    this.dotsWrap.innerHTML = "";
    this.dots = this.cards.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "w-2.5 h-2.5 rounded-full bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400";
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      b.addEventListener("click", () => this.goto(i, true));
      this.dotsWrap.appendChild(b);
      return b;
    });
    this.updateDots();
  }

  updateDots() {
    if (!this.dots.length) return;
    this.dots.forEach((d, i) => {
      if (i === this.current) {
        d.classList.add("bg-indigo-400");
        d.classList.remove("bg-gray-600");
      } else {
        d.classList.remove("bg-indigo-400");
        d.classList.add("bg-gray-600");
      }
    });
  }

  updateButtonsVisibility() {
    if (!this.track || !this.prevBtn || !this.nextBtn) return;
    const overflowing = this.track.scrollWidth > this.track.clientWidth + 8;
    this.prevBtn.style.display = overflowing ? "flex" : "none";
    this.nextBtn.style.display = overflowing ? "flex" : "none";
  }

  scrollToIndex(idx) {
    const clamped = Math.max(0, Math.min(idx, this.cards.length - 1));
    const target = this.cards[clamped];
    if (!target || !this.track) return;
    const left = target.offsetLeft - 8;
    this.track.scrollTo({ left, behavior: "smooth" });
    this.current = clamped;
    this.updateDots();
  }

  goto(idx, user = false) {
    const total = this.cards.length;
    if (total === 0) return;
    const wrapped = (idx + total) % total;
    this.scrollToIndex(wrapped);
    if (user) this.restartAuto();
  }

  bindScrollSync() {
    if (!this.track) return;
    this.track.addEventListener("scroll", () => {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        const scrollLeft = this.track.scrollLeft;
        let nearest = 0;
        let best = Infinity;
        this.cards.forEach((c, i) => {
          const dist = Math.abs(c.offsetLeft - scrollLeft);
          if (dist < best) { best = dist; nearest = i; }
        });
        this.current = nearest;
        this.updateDots();
        this.raf = null;
      });
    });
  }

  bindControls() {
    this.prevBtn?.addEventListener("click", () => this.goto(this.current - 1, true));
    this.nextBtn?.addEventListener("click", () => this.goto(this.current + 1, true));
    if (this.track) {
      this.track.setAttribute("tabindex", "0");
      this.track.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); this.goto(this.current - 1, true); }
        if (e.key === "ArrowRight") { e.preventDefault(); this.goto(this.current + 1, true); }
      });
    }
  }

  startAuto() {
    if (this.autoTimer || !this.autoplayMs) return;
    this.autoTimer = setInterval(() => this.goto(this.current + 1), this.autoplayMs);
  }
  stopAuto() {
    if (!this.autoTimer) return;
    clearInterval(this.autoTimer);
    this.autoTimer = null;
  }
  restartAuto() { this.stopAuto(); this.startAuto(); }

  bindAutoPause() {
    if (!this.track) return;
    this.track.addEventListener("mouseenter", () => this.stopAuto());
    this.track.addEventListener("mouseleave", () => this.startAuto());
    this.track.addEventListener("focusin", () => this.stopAuto());
    this.track.addEventListener("focusout", () => this.startAuto());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.stopAuto(); else this.startAuto();
    });
  }

  init() {
    this.render();
    this.bindScrollSync();
    this.bindControls();
    this.bindAutoPause();
    this.startAuto();
    window.addEventListener("resize", () => this.updateButtonsVisibility());
  }
}

// ----- Certifications List -----
class CertificationsList {
  constructor(opts = {}) {
    this.container = document.getElementById(opts.containerId || "cert-list");
    this.items = [];
  }

  setItems(list) {
    this.items = Array.isArray(list) ? list.slice() : [];
    return this;
  }

  render() {
    if (!this.container) return this;
    this.container.innerHTML = "";
    this.items.forEach(c => {
      const card = document.createElement("article");
      card.className = "bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-white transition-shadow";
      const title = c.name || c.title || "Certification";
      const issuer = c.issuer || c.organization || "";
      const date = c.date || c.issueDate || "";
      const credId = c.credentialId || c.id || "";
      const url = c.url || c.credentialUrl || c.link || "";
      card.innerHTML = `
        <h3 class="font-bold text-lg mb-1">${title}</h3>
        ${issuer ? `<p class=\"text-gray-400 text-sm mb-1\">${issuer}</p>` : ""}
        ${date ? `<p class=\"text-gray-500 text-xs mb-3\">Issued ${date}</p>` : ""}
        ${credId ? `<p class=\"text-gray-500 text-xs mb-3\">Credential ID: ${credId}</p>` : ""}
        ${url ? `<a class=\"inline-block text-indigo-400 hover:text-indigo-300 text-sm\" href=\"${url}\" target=\"_blank\" rel=\"noopener noreferrer\">View credential</a>` : ""}
      `;
      this.container.appendChild(card);
    });
    return this;
  }
}

// ---- Example data (replace with your real projects) ----
const projects = [
  {
    title: "Holti-Health ",
    description: "Holti-Health is an Android app from my Bangkit capstone that checks chili plant health using machine learning. Users upload a photo, and the app shows possible diseases. I worked as Cloud and Backend Engineer, integrating the ML model with FastAPI and cloud services.",
    tech: ["Node.js", "Express", "API","GCP"],
    image: "Image/Screenshot 2025-09-10 132604.png",
    github: "https://github.com/AkmalRendiansyah/Holti-Health",
    demo: "#"
  },
  {
    title: "Flan-BaseVsGpt-Mini40",
    description: "This project uses two LLMs, Flan-Base and GPT-Mini40, to process ePub files and compare their outputs, such as summaries, translations, and explanations.",
    tech: ["Python", "LLM", "Generative AI"],
    image: "Image/Screenshot 2025-09-09 145653.png",
    github: "https://github.com/AHMADFARHANAAAAA/Flan-BaseVsGpt-Mini40",
    demo: "https://flan-basevsgpt-mini40-ephxgaajxnpeyr633kcmmy.streamlit.app/"
  },
  {
    title: "Maps Navigate",
    description: "A web-based application designed to help students and visitors navigate the UIN Jakarta campus easily. The app provides interactive walking route guidance using JavaScript and the OpenStreetMap API",
    tech: ["JavaScript", "Firebase", "Maps"],
    image: "Image/Screenshot 2025-09-09 143837.png",
    github: "https://github.com/AHMADFARHANAAAAA/Maps-",
    demo: "https://maps-2y8w.vercel.app/v2.html"
  },
  
];

// ---- Certifications data (populate from LinkedIn) ----
const certifications = [
  // Example shape:
  { name: "Certification Name", 
    issuer: "Issuer", 
    date: "MMM YYYY", 
    credentialId: "ABC-123", 
    url: "https://..." 
  },
  { name: "Certification Name", 
    issuer: "Issuer", 
    date: "MMM YYYY", 
    credentialId: "ABC-123", 
    url: "https://..." 
  },
];

// ---- Bootstrap controllers ----
window.addEventListener("DOMContentLoaded", () => {
  new SiteNav({ sections: ["hero", "work", "skills", "certifications", "contact"] }).init();
  new ProjectsSlider({ autoplayMs: 5000 }).setProjects(projects).init();
  new CertificationsList({}).setItems(certifications).render();
});

