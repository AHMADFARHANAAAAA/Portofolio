"use strict";

// ----- OOP: Site Navigation Controller -----
class SiteNav {
  constructor(opts = {}) {
    this.menuBtn = document.getElementById(opts.menuBtnId || "menu-btn");
    this.mobileMenu = document.getElementById(opts.mobileMenuId || "mobile-menu");
    this.overlay = document.getElementById(opts.overlayId || "menu-overlay");
    this.sections = opts.sections || ["hero", "work", "skills", "certifications", "contact"];
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

    const hamburger = this.menuBtn.querySelector('.hamburger');

    this.menuBtn.addEventListener("click", () => {
      const isMenuOpen = this.mobileMenu.classList.contains("show");

      if (isMenuOpen) {
        // Close menu with enhanced animations
        this.mobileMenu.classList.remove("show");
        this.overlay?.classList.remove("show");
        hamburger?.classList.remove("open");

        // Wait for animation to complete before hiding
        setTimeout(() => {
          this.mobileMenu.classList.add("hidden");
          this.overlay?.classList.add("hidden");
        }, 400); // Increased timeout to match CSS animation duration

        this.menuBtn.setAttribute("aria-expanded", "false");
      } else {
        // Open menu with enhanced animations
        this.mobileMenu.classList.remove("hidden");
        this.overlay?.classList.remove("hidden");

        // Trigger animation on next frame for smooth transition
        requestAnimationFrame(() => {
          this.mobileMenu.classList.add("show");
          this.overlay?.classList.add("show");
          hamburger?.classList.add("open");
        });

        this.menuBtn.setAttribute("aria-expanded", "true");
      }
    });

    // Close when tapping outside with enhanced feedback
    this.overlay?.addEventListener("click", () => {
      if (this.mobileMenu.classList.contains("show")) {
        this.mobileMenu.classList.remove("show");
        this.overlay.classList.remove("show");
        hamburger?.classList.remove("open");

        setTimeout(() => {
          this.mobileMenu.classList.add("hidden");
          this.overlay.classList.add("hidden");
        }, 400);

        this.menuBtn?.setAttribute("aria-expanded", "false");
      }
    });

    // Enhanced mobile menu link interactions
    this.mobileMenu?.querySelectorAll('a').forEach((link, index) => {
      // Add staggered entrance animations
      link.style.transitionDelay = `${0.1 + (index * 0.05)}s`;

      link.addEventListener('click', () => {
        // Add haptic feedback for mobile
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        this.mobileMenu.classList.remove("show");
        this.overlay?.classList.remove("show");
        hamburger?.classList.remove("open");

        setTimeout(() => {
          this.mobileMenu.classList.add("hidden");
          this.overlay?.classList.add("hidden");
        }, 400);

        this.menuBtn?.setAttribute("aria-expanded", "false");
      });
    });

    // Add keyboard navigation support
    this.menuBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.menuBtn.click();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileMenu.classList.contains("show")) {
        this.mobileMenu.classList.remove("show");
        this.overlay?.classList.remove("show");
        hamburger?.classList.remove("open");

        setTimeout(() => {
          this.mobileMenu.classList.add("hidden");
          this.overlay?.classList.add("hidden");
        }, 400);

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

        e.preventDefault();

        // Immediately activate the clicked link for instant visual feedback
        this.navLinks.forEach(link => {
          link.classList.remove("nav-active");
          link.removeAttribute("aria-current");
        });
        anchor.classList.add("nav-active");
        anchor.setAttribute("aria-current", "page");

        if (targetId === "about") {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }

        // Close mobile menu if open
        if (this.mobileMenu && !this.mobileMenu.classList.contains("hidden")) {
          const hamburger = this.menuBtn?.querySelector('.hamburger');
          this.mobileMenu.classList.remove("show");
          this.overlay?.classList.remove("show");
          hamburger?.classList.remove("open");

          setTimeout(() => {
            this.mobileMenu.classList.add("hidden");
            this.overlay?.classList.add("hidden");
          }, 300);

          this.menuBtn?.setAttribute("aria-expanded", "false");
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
    // Special handling for "About" - activate when at the top of the page or in hero section
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop < 200) {
      // At the top of the page - activate About link
      this.navLinks.forEach(link => {
        link.classList.remove("nav-active");
        link.removeAttribute("aria-current");
        if (link.getAttribute("href") === "#about") {
          link.classList.add("nav-active");
          link.setAttribute("aria-current", "page");
        }
      });
      return;
    }

    // Regular section detection for other sections
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
    this.autoplayMs = typeof opts.autoplayMs === 'number' ? opts.autoplayMs : 1000; // default 5s
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
      article.className = "bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:scale-[1.02]";

      // Compact card design with smaller image area
      const imageHTML = p.image ? `
        <div class="relative w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          <img 
            src="${p.image}" 
            alt="${p.title}" 
            class="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105" 
            width="400" 
            height="200" 
            loading="lazy" 
            decoding="async"
            style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold" style="display:none;">
            <div class="text-center">
              <div class="text-2xl mb-1">${this.getProjectIcon(p.title)}</div>
              <span class="text-sm font-semibold">${p.title.split(' ')[0]}</span>
            </div>
          </div>
          <!-- Subtle overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>
      ` : `
        <div class="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white">
          <div class="text-center">
            <div class="text-3xl mb-2">${this.getProjectIcon(p.title)}</div>
            <span class="text-sm font-semibold">${p.title.split(' ')[0]}</span>
          </div>
        </div>
      `;

      article.innerHTML = `
        ${imageHTML}
        <div class="p-4">
          <h3 class="font-bold text-base sm:text-lg mb-2 leading-tight text-white hover:text-indigo-400 transition-colors duration-200 line-clamp-2">${p.title}</h3>
          <p class="text-gray-400 text-xs sm:text-sm mb-3 leading-relaxed">${p.description}</p>
          ${Array.isArray(p.tech) && p.tech.length ? `
            <div class="flex flex-wrap gap-1 mb-3">
              ${p.tech.slice(0, 3).map(t => `<span class="px-2 py-0.5 rounded-full bg-gray-800 hover:bg-indigo-600 text-xs text-gray-300 hover:text-white transition-all duration-200">${t}</span>`).join("")}
              ${p.tech.length > 3 ? `<span class="px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-400">+${p.tech.length - 3}</span>` : ""}
            </div>` : ""}
          ${(p.github && p.github !== "#") || (p.demo && p.demo !== "#") ? `
            <div class="flex gap-3 text-xs">
              ${p.github && p.github !== "#" ? `<a class="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-all duration-200" href="${p.github}" target="_blank" rel="noopener noreferrer">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path></svg>
                Code
              </a>` : ""}
              ${p.demo && p.demo !== "#" ? `<a class="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-all duration-200" href="${p.demo}" target="_blank" rel="noopener noreferrer">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                Live
              </a>` : ""}
            </div>` : ""}
        </div>
      `;
      this.track.appendChild(article);
    });

    // Compact card sizing - larger cards for better content visibility
    this.cards = Array.from(this.track.querySelectorAll("article"));
    this.cards.forEach(card => {
      card.classList.add("snap-start", "min-w-[340px]", "max-w-[400px]", "w-[340px]", "sm:w-[380px]", "md:w-[400px]");
    });

    this.setupDots();
    this.updateButtonsVisibility();
    return this;
  }

  // Helper method to get project icons
  getProjectIcon(title) {
    const icons = {
      'Holti-Health': '🌿',
      'Flan-BaseVsGpt-Mini40': '🤖',
      'Maps': '🗺️',
      'Eduversal': '📚'
    };

    for (let key in icons) {
      if (title.toLowerCase().includes(key.toLowerCase())) {
        return icons[key];
      }
    }
    return '💼'; // default icon
  }

  setupDots() {
    if (!this.dotsWrap) return;
    this.dotsWrap.innerHTML = "";
    this.dots = [];
    // Dots are now hidden/removed
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
    if (!this.autoTimer && this.autoplayMs) {
      this.autoTimer = setInterval(() => this.goto(this.current + 1), this.autoplayMs);
    }
  }

  stopAuto() {
    if (!this.autoTimer) return;
    clearInterval(this.autoTimer);
    this.autoTimer = null;
  }

  restartAuto() {
    this.stopAuto();
    this.startAuto();
  }

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
        ${issuer ? `<p class="text-gray-400 text-sm mb-1">${issuer}</p>` : ""}
        ${date ? `<p class="text-gray-500 text-xs mb-3">Issued ${date}</p>` : ""}
        ${credId ? `<p class="text-gray-500 text-xs mb-3">Credential ID: ${credId}</p>` : ""}
        ${url ? `<a class="inline-block text-indigo-400 hover:text-indigo-300 text-sm" href="${url}" target="_blank" rel="noopener noreferrer">View credential</a>` : ""}
      `;
      this.container.appendChild(card);
    });
    return this;
  }
}

// ---- Project data ----
const projects = [
  {
    title: "Holti-Health",
    description: "Android app to detect chili plant diseases using machine learning. I built the backend and cloud integration.",
    tech: ["Node.js", "Express", "API", "GCP"],
    image: "Image/Screenshot 2025-09-10 132604.png",
    github: "https://github.com/AkmalRendiansyah/Holti-Health",
    demo: "#"
  },
  {
    title: "Flan-BaseVsGpt-Mini40",
    description: "Compares two AI models (Flan-Base & GPT-Mini40) for ePub file processing and output analysis.",
    tech: ["Python", "LLM", "Generative AI"],
    image: "Image/llm.png",
    github: "https://github.com/AHMADFARHANAAAAA/Flan-BaseVsGpt-Mini40",
    demo: "https://flan-basevsgpt-mini40-ephxgaajxnpeyr633kcmmy.streamlit.app/"
  },
  {
    title: "Maps Navigate",
    description: "Campus navigation app for UIN Jakarta with interactive walking routes.",
    tech: ["JavaScript", "Firebase", "Maps"],
    image: "Image/nav.png",
    github: "https://github.com/AHMADFARHANAAAAA/Maps-",
    demo: "https://maps-2y8w.vercel.app/v2.html"
  },
  {
    title: "Eduversal",
    description: "Company website for education sector, built with HTML, CSS, JS, and WordPress.",
    tech: ["Html", "Css", "JavaScript", "Wordpress"],
    image: "Image/edu.png",
    demo: "https://eduversal.org/"
  }
];

// ---- Certifications data ----
const certifications = [
  {
    name: "Google Cloud Associate Cloud Engineer",
    issuer: "Google Cloud",
    date: "Dec 2023",
    credentialId: "GCC-ACE-2023",
    url: "#"
  },
  {
    name: "Machine Learning Specialization",
    issuer: "Coursera",
    date: "Nov 2023",
    credentialId: "ML-SPEC-2023",
    url: "#"
  },
  {
    name: "JavaScript Algorithms and Data Structures",
    issuer: "FreeCodeCamp",
    date: "Oct 2023",
    credentialId: "JS-ALGO-2023",
    url: "#"
  }
];

// ---- Bootstrap controllers ----
window.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing site navigation...");
  const siteNav = new SiteNav({ sections: ["hero", "work", "skills", "certifications", "contact"] });
  siteNav.init();

  console.log("Initializing projects slider...");
  const projectsSlider = new ProjectsSlider({ autoplayMs: 2000 });
  projectsSlider.setProjects(projects).init();

  console.log("Initializing certifications...");
  const certsList = new CertificationsList({});
  certsList.setItems(certifications).render();

  console.log("Site initialization complete!");
});
