(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var mobileToggle = qs('.mobile-toggle');
  var mobileNav = qs('.mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa('[data-filter-panel]').forEach(function (panel) {
    var root = panel.parentElement;
    var list = qs('[data-filter-list]', root);
    var empty = qs('[data-empty-state]', root);
    if (!list) {
      return;
    }
    var cards = qsa('[data-title]', list);
    var search = qs('[data-list-search]', panel);
    var year = qs('[data-list-year]', panel);
    var region = qs('[data-list-region]', panel);
    var type = qs('[data-list-type]', panel);

    function value(el) {
      return el ? el.value.trim().toLowerCase() : '';
    }

    function filter() {
      var q = value(search);
      var y = value(year);
      var r = value(region);
      var t = value(type);
      var shown = 0;

      cards.forEach(function (card) {
        var hay = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var ok = true;
        ok = ok && (!q || hay.indexOf(q) !== -1);
        ok = ok && (!y || (card.getAttribute('data-year') || '').toLowerCase() === y);
        ok = ok && (!r || (card.getAttribute('data-region') || '').toLowerCase() === r);
        ok = ok && (!t || (card.getAttribute('data-type') || '').toLowerCase() === t);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [search, year, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', filter);
        el.addEventListener('change', filter);
      }
    });
  });

  function createResultCard(item) {
    var link = document.createElement('a');
    link.className = 'movie-row card-hover';
    link.href = item.href;
    link.innerHTML = [
      '<div class="row-poster poster-frame"><img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></div>',
      '<div class="row-body">',
      '<div class="tag-list"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>'
    ].join('');
    return link;
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  var results = qs('[data-search-results]');
  if (results && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var input = qs('[data-search-input]');
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    if (query) {
      var normalized = query.toLowerCase();
      var matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
        return [item.title, item.region, item.year, item.type, item.genre, item.tags].join(' ').toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 80);
      var title = document.createElement('h2');
      title.className = 'search-title';
      title.textContent = '搜索结果';
      results.appendChild(title);
      if (matches.length) {
        var grid = document.createElement('div');
        grid.className = 'wide-grid';
        matches.forEach(function (item) {
          grid.appendChild(createResultCard(item));
        });
        results.appendChild(grid);
      } else {
        var empty = document.createElement('div');
        empty.className = 'empty-state is-visible';
        empty.textContent = '没有匹配影片';
        results.appendChild(empty);
      }
    }
  }

  qsa('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.opacity = '0';
    }, { once: true });
  });
})();
