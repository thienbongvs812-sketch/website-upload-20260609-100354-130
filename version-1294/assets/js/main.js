(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().replace(/\s+/g, "");
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var opened = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var current = 0;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }
        });

        var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".movie-filter-input"));
        var searchParams = new URLSearchParams(window.location.search);
        var q = searchParams.get("q") || "";

        filterInputs.forEach(function (input) {
            if (input.classList.contains("search-query-input") && q) {
                input.value = q;
            }

            function applyFilter() {
                var term = normalize(input.value);
                var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search") || card.textContent);
                    card.classList.toggle("is-filtered-out", term && haystack.indexOf(term) === -1);
                });
            }

            input.addEventListener("input", applyFilter);
            applyFilter();
        });
    });
})();
