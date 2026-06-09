(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', mobilePanel.classList.contains('is-open'));
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let currentSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5000);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
        startHero();
      }
    });
  });

  showSlide(0);
  startHero();

  document.querySelectorAll('[data-site-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  const filterInput = document.querySelector('[data-filter-input]');
  const filterButton = document.querySelector('[data-filter-button]');
  const cards = Array.from(document.querySelectorAll('[data-search-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function applyFilter() {
    if (!filterInput || !cards.length) {
      return;
    }

    const keyword = filterInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = (card.getAttribute('data-search-text') || '').toLowerCase();
      const matched = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle('hidden-by-filter', !matched);
      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterButton) {
    filterButton.addEventListener('click', applyFilter);
  }
})();
