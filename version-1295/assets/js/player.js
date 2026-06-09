(function () {
  function start(root) {
    const video = root.querySelector('video');
    const cover = root.querySelector('[data-player-cover]');
    const button = root.querySelector('[data-play-button]');
    const source = root.getAttribute('data-src');
    let loaded = false;
    let hls = null;

    if (!video || !source) {
      return;
    }

    function playVideo() {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function loadSource() {
      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }

      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
    }

    if (button) {
      button.addEventListener('click', loadSource);
    }

    if (cover) {
      cover.addEventListener('click', loadSource);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        loadSource();
        return;
      }

      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(start);
})();
