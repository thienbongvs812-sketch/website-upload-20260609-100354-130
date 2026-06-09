(function() {
  var movies = window.SEARCH_MOVIES || [];
  var keywordInput = document.querySelector('[data-search-keyword]');
  var regionSelect = document.querySelector('[data-search-region]');
  var typeSelect = document.querySelector('[data-search-type]');
  var yearSelect = document.querySelector('[data-search-year]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');

  if (!results) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(movie) {
    return '<article class="movie-card card-hover">' +
      '<a class="poster-wrap" href="' + escapeHtml(movie.href) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function render(items) {
    var shown = items.slice(0, 120);
    results.innerHTML = shown.map(card).join('');
    if (status) {
      status.textContent = shown.length ? '相关内容' : '暂无匹配内容';
    }
  }

  function apply() {
    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var matched = movies.filter(function(movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      return (!keyword || haystack.indexOf(keyword) !== -1) &&
        (!region || movie.region === region) &&
        (!type || movie.type === type) &&
        (!year || movie.year === year);
    });
    render(matched);
  }

  var params = new URLSearchParams(window.location.search);
  var initialKeyword = params.get('q');
  if (initialKeyword && keywordInput) {
    keywordInput.value = initialKeyword;
  }

  [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function(control) {
    if (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    }
  });

  if (initialKeyword) {
    apply();
  }
})();
