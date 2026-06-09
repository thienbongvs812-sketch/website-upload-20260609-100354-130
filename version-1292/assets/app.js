(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = menu.classList.toggle("open");
      document.body.classList.toggle("menu-open", opened);
      button.textContent = opened ? "×" : "☰";
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input.hasAttribute("data-query-input")) {
      input.value = query;
    }

    function apply() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || card.textContent.toLowerCase();
        card.hidden = value.length > 0 && text.indexOf(value) === -1;
      });
    }

    input.addEventListener("input", apply);
    apply();
  }

  function startPlayer(card) {
    var video = card.querySelector("video");
    var stream = card.getAttribute("data-stream");
    if (!video || !stream) {
      return;
    }

    if (video.getAttribute("data-ready") !== "1") {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = stream;
      }
      video.setAttribute("data-ready", "1");
    }

    card.classList.add("is-playing");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
    players.forEach(function (card) {
      var overlay = card.querySelector(".player-overlay");
      var video = card.querySelector("video");
      if (overlay) {
        overlay.addEventListener("click", function () {
          startPlayer(card);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.getAttribute("data-ready") !== "1") {
            startPlayer(card);
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
