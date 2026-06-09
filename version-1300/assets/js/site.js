(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    function syncHeader() {
      if (!header) {
        return;
      }

      if (window.scrollY > 16) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && nav && header) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        header.classList.toggle("menu-open", nav.classList.contains("is-open"));
      });
    }
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (!slides.length) {
      return;
    }

    var active = 0;
    var timer = null;

    function setActive(next) {
      active = (next + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-active", index === active);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        setActive(active + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      start();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setActive(index);
        restart();
      });
    });

    setActive(0);
    start();
  }

  function initGlobalSearch() {
    Array.prototype.slice.call(document.querySelectorAll("[data-global-search]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";

        if (!query) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initSearchFilter() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));

    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-chip]"));
      var scopeSelector = panel.getAttribute("data-search-panel");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
      var empty = scope ? scope.parentElement.querySelector(".empty-state") : null;
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function activeFilters() {
        return chips.filter(function (chip) {
          return chip.classList.contains("is-active");
        }).map(function (chip) {
          return {
            key: chip.getAttribute("data-filter-key"),
            value: chip.getAttribute("data-filter-value")
          };
        });
      }

      function includesText(card, query) {
        if (!query) {
          return true;
        }

        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.textContent
        ].join(" ").toLowerCase();

        return haystack.indexOf(query.toLowerCase()) !== -1;
      }

      function matchesFilters(card, filters) {
        return filters.every(function (filter) {
          var value = card.getAttribute("data-" + filter.key) || "";
          return value.indexOf(filter.value) !== -1;
        });
      }

      function apply() {
        var query = input ? input.value.trim() : "";
        var filters = activeFilters();
        var visible = 0;

        cards.forEach(function (card) {
          var ok = includesText(card, query) && matchesFilters(card, filters);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      var button = panel.querySelector(".search-button");

      if (button) {
        button.addEventListener("click", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var isActive = chip.classList.contains("is-active");
          chips.forEach(function (other) {
            if (other.getAttribute("data-filter-key") === chip.getAttribute("data-filter-key")) {
              other.classList.remove("is-active");
            }
          });
          chip.classList.toggle("is-active", !isActive);
          apply();
        });
      });

      apply();
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initGlobalSearch();
    initSearchFilter();
  });
})();
