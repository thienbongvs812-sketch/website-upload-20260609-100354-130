(function() {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var mobileNav = qs('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var slider = qs('[data-hero-slider]');
  if (slider) {
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function() {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  }

  qsa('[data-filter-scope]').forEach(function(scope) {
    var section = scope.closest('section') || document;
    var input = qs('[data-filter-input]', section);
    var yearSelect = qs('[data-filter-year]', section);
    var typeSelect = qs('[data-filter-type]', section);
    var cards = qsa('.movie-card, .movie-card-wide, .movie-list-card', scope);

    if (!input && !yearSelect && !typeSelect) {
      return;
    }

    function uniqueValues(attr) {
      var values = [];
      cards.forEach(function(card) {
        var value = card.getAttribute(attr) || '';
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      return values.sort(function(a, b) {
        return b.localeCompare(a, 'zh-CN', { numeric: true });
      });
    }

    if (yearSelect) {
      uniqueValues('data-year').forEach(function(value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        yearSelect.appendChild(option);
      });
    }

    if (typeSelect) {
      uniqueValues('data-type').forEach(function(value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        typeSelect.appendChild(option);
      });
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function(card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        var matchedType = !type || card.getAttribute('data-type') === type;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedType));
      });
    }

    [input, yearSelect, typeSelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
})();
