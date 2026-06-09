(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function initMenu() {
    const toggle = document.querySelector('.js-menu-toggle');
    const nav = document.querySelector('.js-site-nav');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    const hero = document.querySelector('.js-hero');

    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('.js-hero-prev');
    const next = hero.querySelector('.js-hero-next');
    let active = 0;
    let timer = null;

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
        dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false');
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(active + 1), 5200);
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (slides.length <= 1) {
      show(0);
      return;
    }

    prev?.addEventListener('click', () => {
      show(active - 1);
      restart();
    });

    next?.addEventListener('click', () => {
      show(active + 1);
      restart();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        restart();
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    const panel = document.querySelector('.js-filter-panel');

    if (!panel) {
      return;
    }

    const input = panel.querySelector('.js-filter-input');
    const year = panel.querySelector('.js-year-filter');
    const region = panel.querySelector('.js-region-filter');
    const type = panel.querySelector('.js-type-filter');
    const count = panel.querySelector('.js-filter-count');
    const cards = Array.from(document.querySelectorAll('.js-card'));

    const apply = () => {
      const keyword = (input?.value || '').trim().toLowerCase();
      const yearValue = year?.value || '';
      const regionValue = region?.value || '';
      const typeValue = type?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const searchText = (card.dataset.search || '').toLowerCase();
        const matchesKeyword = !keyword || searchText.includes(keyword);
        const matchesYear = !yearValue || card.dataset.year === yearValue;
        const matchesRegion = !regionValue || card.dataset.region === regionValue;
        const matchesType = !typeValue || card.dataset.type === typeValue;
        const shouldShow = matchesKeyword && matchesYear && matchesRegion && matchesType;

        card.classList.toggle('is-filter-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    };

    [input, year, region, type].forEach((control) => {
      control?.addEventListener('input', apply);
      control?.addEventListener('change', apply);
    });

    apply();
  }

  function initPlayer() {
    const button = document.querySelector('.js-play-video');
    const video = document.querySelector('.js-video-player');
    const message = document.querySelector('.js-player-message');

    if (!button || !video) {
      return;
    }

    let hlsInstance = null;

    const setMessage = (text) => {
      if (message) {
        message.textContent = text;
      }
    };

    button.addEventListener('click', async () => {
      const source = video.dataset.src;

      if (!source) {
        setMessage('当前影片暂未配置播放源。');
        return;
      }

      button.classList.add('is-hidden');

      try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        await video.play();
        setMessage('正在播放。');
      } catch (error) {
        button.classList.remove('is-hidden');
        setMessage('播放启动被浏览器拦截或网络源暂时不可用，请再次点击播放或稍后重试。');
      }
    });
  }

  function movieCardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 3)
      .map((tag) => `<span>${escapeHtml(tag)}</span>`)
      .join('');

    return `
      <article class="movie-card js-card">
        <a class="poster-link" href="./${escapeHtml(movie.url)}">
          <img src="./${escapeHtml(movie.cover)}.jpg" alt="${escapeHtml(movie.title)} 封面" loading="lazy">
          <span class="play-badge">播放</span>
        </a>
        <div class="card-body">
          <div class="tag-row">${tags}</div>
          <h3><a href="./${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
          <p>${escapeHtml(movie.oneLine)}</p>
          <div class="meta-line">
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.type)}</span>
            <span>${escapeHtml(movie.year)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function initSearchPage() {
    const form = document.querySelector('.js-search-form');
    const input = document.querySelector('.js-site-search');
    const results = document.querySelector('.js-search-results');
    const count = document.querySelector('.js-search-count');

    if (!form || !input || !results || !window.MOVIE_INDEX) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;

    const render = () => {
      const keyword = input.value.trim().toLowerCase();
      const source = window.MOVIE_INDEX;
      const matches = keyword
        ? source.filter((movie) => movie.search.includes(keyword))
        : source.slice(0, 80);

      if (count) {
        count.textContent = keyword ? String(matches.length) : '80';
      }

      if (matches.length === 0) {
        results.innerHTML = '<div class="search-empty">没有找到匹配影片，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = matches.slice(0, 240).map(movieCardTemplate).join('');
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const params = new URLSearchParams(window.location.search);
      const keyword = input.value.trim();
      if (keyword) {
        params.set('q', keyword);
      } else {
        params.delete('q');
      }
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState(null, '', nextUrl);
      render();
    });

    input.addEventListener('input', render);
    render();
  }

  ready(() => {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
    initSearchPage();
  });
})();
