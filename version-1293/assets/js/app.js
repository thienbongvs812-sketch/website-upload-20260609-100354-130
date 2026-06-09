(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const setActive = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => setActive(active + 1), 5200);
    };

    if (slides.length > 1) {
      prev?.addEventListener('click', () => {
        setActive(active - 1);
        start();
      });

      next?.addEventListener('click', () => {
        setActive(active + 1);
        start();
      });

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          setActive(index);
          start();
        });
      });

      start();
    }
  }

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach((panel) => {
    const scope = panel.closest('main') || document;
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const search = panel.querySelector('[data-filter-search]');
    const year = panel.querySelector('[data-filter-year]');
    const type = panel.querySelector('[data-filter-type]');
    const category = panel.querySelector('[data-filter-category]');
    const empty = scope.querySelector('[data-empty-state]');

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && search) {
      search.value = query;
    }

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const apply = () => {
      const q = normalize(search?.value);
      const y = normalize(year?.value);
      const t = normalize(type?.value);
      const c = normalize(category?.value);
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.category
        ].join(' '));
        const okQuery = !q || haystack.includes(q);
        const okYear = !y || normalize(card.dataset.year) === y;
        const okType = !t || normalize(card.dataset.type) === t;
        const okCategory = !c || normalize(card.dataset.category) === c;
        const show = okQuery && okYear && okType && okCategory;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [search, year, type, category].forEach((control) => {
      control?.addEventListener('input', apply);
      control?.addEventListener('change', apply);
    });

    apply();
  });
})();
