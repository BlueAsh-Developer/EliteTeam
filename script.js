(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /* 1. Footer year */
    var yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    /* 2. Custom cursor */
    var cursor = document.querySelector(".cursor");
    var dot = document.querySelector(".cursor__dot");
    var ring = document.querySelector(".cursor__ring");
    var finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    if (finePointer && cursor && dot && ring) {
      var mouseX = window.innerWidth / 2;
      var mouseY = window.innerHeight / 2;
      var ringX = mouseX;
      var ringY = mouseY;
      var rafId = null;

      function render() {
        dot.style.transform =
          "translate(" + mouseX + "px," + mouseY + "px) translate(-50%,-50%)";
        ring.style.transform =
          "translate(" + ringX + "px," + ringY + "px) translate(-50%,-50%)";
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        rafId = requestAnimationFrame(render);
      }

      window.addEventListener("mousemove", function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(render);
      });

      var hoverEls = document.querySelectorAll(
        "a, button, input, [data-magnetic]"
      );
      hoverEls.forEach(function (el) {
        el.addEventListener("mouseenter", function () {
          cursor.classList.add("is-hover");
        });
        el.addEventListener("mouseleave", function () {
          cursor.classList.remove("is-hover");
        });
      });

      document.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-hover");
      });
    }

    /* 3. Nav scrolled state */
    var nav = document.getElementById("nav");
    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 30) {
        nav.classList.add("nav--scrolled");
      } else {
        nav.classList.remove("nav--scrolled");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* 4. Scroll reveal */
    var reveals = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
        el.style.transitionDelay = "0ms";
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var el = entry.target;
              var delay = (Number(el.dataset.delay) || 0) * 90;
              el.style.transitionDelay = delay + "ms";
              el.classList.add("is-visible");
              revealObserver.unobserve(el);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach(function (el) {
        revealObserver.observe(el);
      });
    }

    /* 5. Magnetic buttons */
    if (!reduceMotion) {
      var magnets = document.querySelectorAll("[data-magnetic]");
      magnets.forEach(function (el) {
        var strength = 0.35;
        el.addEventListener("mousemove", function (e) {
          var rect = el.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = (e.clientX - cx) * strength;
          var dy = (e.clientY - cy) * strength;
          el.style.transition = "transform 0.05s linear";
          el.style.transform =
            "translate(" + dx + "px," + dy + "px)";
        });
        el.addEventListener("mouseleave", function () {
          el.style.transition =
            "transform 0.3s cubic-bezier(0.2,0.8,0.2,1)";
          el.style.transform = "none";
        });
      });
    }

    /* 6. Counters */
    var counters = document.querySelectorAll(".metric__value[data-count]");
    function animateCount(el) {
      var target = parseFloat(el.dataset.count) || 0;
      var suffix = el.dataset.suffix || "";
      var duration = 1600;
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      var start = null;
      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var val = Math.round(easeOutExpo(p) * target);
        el.textContent = val + suffix;
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }
      requestAnimationFrame(step);
    }

    var metricsSection = document.getElementById("metrics");
    if (counters.length) {
      if (reduceMotion || !("IntersectionObserver" in window)) {
        counters.forEach(animateCount);
      } else {
        var countObserver = new IntersectionObserver(
          function (entries, obs) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                animateCount(entry.target);
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.4 }
        );
        counters.forEach(function (el) {
          countObserver.observe(el);
        });
      }
    }

    /* 7. CTA form */
    var form = document.getElementById("ctaForm");
    var note = document.getElementById("ctaNote");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector('input[name="email"]');
        var email = (input && input.value || "").trim();
        var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!note) return;
        if (!valid) {
          note.textContent = "Please enter a valid work email.";
          note.style.color = "var(--gold)";
          if (input) input.focus();
          return;
        }
        note.textContent =
          "Thanks — we'll match your squad within 48 hours. ✦";
        note.style.color = "var(--cyan)";
        form.reset();
      });
    }

    /* 8. Subtle aurora parallax */
    var blobs = document.querySelectorAll(".aurora__blob");
    if (!reduceMotion && blobs.length && finePointer) {
      var tx = 0;
      var ty = 0;
      window.addEventListener(
        "mousemove",
        function (e) {
          tx = (e.clientX / window.innerWidth - 0.5) * 30;
          ty = (e.clientY / window.innerHeight - 0.5) * 30;
          blobs.forEach(function (blob, i) {
            var factor = (i + 1) * 0.5;
            blob.style.marginLeft = tx * factor + "px";
            blob.style.marginTop = ty * factor + "px";
          });
        },
        { passive: true }
      );
    }

    /* 9. Billing toggle (pricing) */
    var billingBtns = document.querySelectorAll(".billing-toggle__btn");
    var priceEls = document.querySelectorAll(".plan__price[data-monthly]");
    var periodEls = document.querySelectorAll(".plan__period[data-period-label]");
    if (billingBtns.length) {
      function setPeriod(isAnnual) {
        billingBtns.forEach(function (b) {
          var active = (b.dataset.period === "annual") === isAnnual;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        priceEls.forEach(function (el) {
          el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
        });
        periodEls.forEach(function (el) {
          el.textContent = isAnnual ? "/mo, billed yearly" : "/mo";
        });
        try {
          localStorage.setItem("et_billing", isAnnual ? "annual" : "monthly");
        } catch (e) {}
      }
      billingBtns.forEach(function (b) {
        b.addEventListener("click", function () {
          setPeriod(b.dataset.period === "annual");
        });
      });
      var saved = null;
      try {
        saved = localStorage.getItem("et_billing");
      } catch (e) {}
      if (saved === "annual") setPeriod(true);
    }

    /* 10. Accordion (shared, pricing + support) */
    var accordions = document.querySelectorAll(".accordion");
    accordions.forEach(function (acc) {
      acc.addEventListener("click", function (e) {
        var trigger = e.target.closest(".accordion__trigger");
        if (!trigger) return;
        var item = trigger.closest(".accordion__item");
        if (!item) return;
        var isOpen = item.classList.contains("is-open");
        acc.querySelectorAll(".accordion__item").forEach(function (it) {
          it.classList.remove("is-open");
          var t = it.querySelector(".accordion__trigger");
          if (t) t.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });

    /* 11. Support search + category filter (support) */
    var searchInput = document.getElementById("supportSearch");
    var supportAcc = document.getElementById("supportAccordion");
    var faqEmpty = document.getElementById("faqEmpty");
    var chips = document.querySelectorAll(".cat-chip");
    var catCards = document.querySelectorAll(".cat");

    if (searchInput && supportAcc) {
      var faqItems = Array.prototype.slice.call(
        supportAcc.querySelectorAll(".accordion__item")
      );
      var activeCategory = "all";

      function applyFilters() {
        var q = searchInput.value.trim().toLowerCase();
        var visible = 0;
        faqItems.forEach(function (item) {
          var hay = (item.dataset.search || item.textContent || "").toLowerCase();
          var matchesSearch = !q || hay.indexOf(q) !== -1;
          var matchesCat =
            activeCategory === "all" ||
            item.dataset.category === activeCategory;
          var show = matchesSearch && matchesCat;
          item.style.display = show ? "" : "none";
          if (show) visible++;
        });
        if (faqEmpty) faqEmpty.hidden = visible !== 0;
      }

      function setCategory(cat) {
        activeCategory = cat;
        chips.forEach(function (c) {
          c.classList.toggle("is-active", c.dataset.category === cat);
        });
        catCards.forEach(function (c) {
          c.classList.toggle("is-active", c.dataset.category === cat);
        });
        applyFilters();
      }

      searchInput.addEventListener("input", applyFilters);
      chips.forEach(function (c) {
        c.addEventListener("click", function () {
          setCategory(c.dataset.category);
        });
      });
      catCards.forEach(function (c) {
        c.addEventListener("click", function () {
          setCategory(c.dataset.category);
          var head = supportAcc.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: head, behavior: "smooth" });
        });
      });
    }

    /* 12. Ticket form (support) */
    var ticketForm = document.getElementById("ticketForm");
    if (ticketForm) {
      var banner = document.getElementById("ticketBanner");
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      function setError(name, msg) {
        var field = ticketForm.querySelector('[name="' + name + '"]');
        var wrap = field ? field.closest(".field") : null;
        var err = ticketForm.querySelector('[data-error-for="' + name + '"]');
        if (wrap) wrap.classList.toggle("has-error", !!msg);
        if (err) err.textContent = msg || "";
      }

      function validate() {
        var name = ticketForm.querySelector('[name="name"]').value.trim();
        var email = ticketForm.querySelector('[name="email"]').value.trim();
        var topic = ticketForm.querySelector('[name="topic"]').value;
        var message = ticketForm.querySelector('[name="message"]').value.trim();
        var ok = true;

        if (!name) { setError("name", "Please enter your name."); ok = false; }
        else setError("name", "");

        if (!emailRe.test(email)) { setError("email", "Enter a valid email address."); ok = false; }
        else setError("email", "");

        if (!topic) { setError("topic", "Please choose a topic."); ok = false; }
        else setError("topic", "");

        if (message.length < 10) { setError("message", "Message must be at least 10 characters."); ok = false; }
        else setError("message", "");

        return ok;
      }

      ticketForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (banner) banner.hidden = true;
        if (!validate()) return;
        var ticket = "ET-" + String(Math.floor(1000 + Math.random() * 9000));
        if (banner) {
          banner.hidden = false;
          banner.textContent =
            "Thanks — we've opened ticket #" + ticket + ". We'll reply within 24 hours.";
        }
        ticketForm.reset();
      });

      ticketForm.addEventListener("input", function (e) {
        if (e.target && e.target.name) setError(e.target.name, "");
      });
    }
  });
})();
