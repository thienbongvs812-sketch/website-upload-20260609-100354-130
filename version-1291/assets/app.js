(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-site-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    document.querySelectorAll('[data-card-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-card-filter]');
        var region = scope.querySelector('[data-region-filter]');
        var type = scope.querySelector('[data-type-filter]');
        var count = scope.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

        if (!cards.length) {
            return;
        }

        if (input && getQueryValue('q')) {
            input.value = getQueryValue('q');
        }

        function applyFilter() {
            var q = normalize(input && input.value);
            var selectedRegion = normalize(region && region.value);
            var selectedType = normalize(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var searchable = normalize(card.getAttribute('data-search'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matched = true;

                if (q && searchable.indexOf(q) === -1) {
                    matched = false;
                }

                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }

                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '匹配 ' + visible + ' 部';
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (region) {
            region.addEventListener('change', applyFilter);
        }

        if (type) {
            type.addEventListener('change', applyFilter);
        }

        applyFilter();
    });
}());
