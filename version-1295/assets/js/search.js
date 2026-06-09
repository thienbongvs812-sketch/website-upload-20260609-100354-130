(function () {
  const input = document.querySelector('[data-search-input]');
  const button = document.querySelector('[data-search-button]');
  const results = document.querySelector('[data-search-results]');
  const count = document.querySelector('[data-search-count]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

  function card(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-search-card>',
      '  <a href="' + movie.url + '" class="poster-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <div class="poster-layer"><span>立即观看</span></div>',
      '    </div>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function search() {
    if (!results) {
      return;
    }

    const keyword = input ? input.value.trim().toLowerCase() : '';
    const matched = movies.filter(function (movie) {
      const text = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();

      return !keyword || text.indexOf(keyword) !== -1;
    });

    const visible = matched.slice(0, 200);
    results.innerHTML = visible.map(card).join('');

    if (count) {
      count.textContent = keyword
        ? '找到 ' + matched.length + ' 部相关影片，当前显示前 ' + visible.length + ' 部'
        : '共收录 ' + movies.length + ' 部影片，输入关键词可快速筛选';
    }
  }

  if (input) {
    input.value = initialQuery;
    input.addEventListener('input', search);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        search();
      }
    });
  }

  if (button) {
    button.addEventListener('click', search);
  }

  search();
})();
