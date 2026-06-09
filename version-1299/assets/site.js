(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function imageErrorHandler(event) {
    var target = event.target;
    if (target && target.classList && target.classList.contains("cover-image")) {
      target.style.opacity = "0";
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
    var keyword = document.querySelector("[data-filter-keyword]");
    var type = document.querySelector("[data-filter-type]");
    var region = document.querySelector("[data-filter-region]");
    var year = document.querySelector("[data-filter-year]");
    var empty = document.querySelector("[data-filter-empty]");

    function inYearRange(value, range) {
      var num = parseInt(value, 10);
      if (!range) {
        return true;
      }
      if (range === "new") {
        return num >= 2025;
      }
      if (range === "recent") {
        return num >= 2020 && num <= 2024;
      }
      if (range === "classic") {
        return num >= 2010 && num <= 2019;
      }
      if (range === "older") {
        return num < 2010;
      }
      return true;
    }

    function apply() {
      var q = normalize(keyword && keyword.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" "));
        var match = true;
        if (q && haystack.indexOf(q) === -1) {
          match = false;
        }
        if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
          match = false;
        }
        if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
          match = false;
        }
        if (!inYearRange(card.getAttribute("data-year"), yearValue)) {
          match = false;
        }
        card.classList.toggle("is-hidden-card", !match);
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [keyword, type, region, year].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });
    apply();
  }

  function cardTemplate(entry) {
    var tags = (entry.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeText(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-title=\"" + escapeText(entry.title) + "\" data-region=\"" + escapeText(entry.region) + "\" data-type=\"" + escapeText(entry.type) + "\" data-year=\"" + escapeText(entry.year) + "\" data-genre=\"" + escapeText(entry.genre) + "\">" +
      "<a class=\"movie-cover\" href=\"" + escapeText(entry.url) + "\" aria-label=\"观看" + escapeText(entry.title) + "\">" +
      "<img class=\"cover-image\" src=\"" + escapeText(entry.image) + "\" alt=\"" + escapeText(entry.title) + "\" loading=\"lazy\">" +
      "<span class=\"cover-shade\"></span><span class=\"cover-play\">播放</span></a>" +
      "<div class=\"movie-info\"><div class=\"movie-meta\"><span>" + escapeText(entry.year) + "</span><span>" + escapeText(entry.region) + "</span><span>" + escapeText(entry.type) + "</span></div>" +
      "<h3><a href=\"" + escapeText(entry.url) + "\">" + escapeText(entry.title) + "</a></h3>" +
      "<p>" + escapeText(entry.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-search-input]");
    var target = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (!input || !target || !window.catalogEntries) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }
    function render() {
      var q = normalize(input.value);
      if (!q) {
        target.innerHTML = window.catalogEntries.slice(0, 40).map(cardTemplate).join("");
        if (empty) {
          empty.style.display = "none";
        }
        return;
      }
      var matches = window.catalogEntries.filter(function (entry) {
        return normalize([
          entry.title,
          entry.region,
          entry.type,
          entry.year,
          entry.genre,
          (entry.tags || []).join(" "),
          entry.oneLine
        ].join(" ")).indexOf(q) !== -1;
      }).slice(0, 120);
      target.innerHTML = matches.map(cardTemplate).join("");
      if (empty) {
        empty.style.display = matches.length ? "none" : "block";
      }
    }
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    document.addEventListener("error", imageErrorHandler, true);
    setupNavigation();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
