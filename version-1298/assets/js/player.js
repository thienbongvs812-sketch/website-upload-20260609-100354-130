(function () {
  window.startCinemaPlayer = function (url) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playerOverlay');
    var status = document.getElementById('playerStatus');
    var hls = null;
    var started = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('点击播放器继续播放');
        });
      }
    }

    function start() {
      if (!video || started) {
        if (video) {
          playVideo();
        }
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setStatus('正在加载...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
          playVideo();
        }, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放失败，请稍后再试');
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
            started = false;
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
      } else {
        video.src = url;
        playVideo();
        setStatus('');
      }
    }

    if (!video) {
      return;
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setStatus('');
    });
  };
})();
