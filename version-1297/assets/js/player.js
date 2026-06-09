function initMoviePlayer(source) {
  var shell = document.getElementById('movie-player');
  var video = document.getElementById('main-video');
  if (!shell || !video || !source) {
    return;
  }

  var button = shell.querySelector('.play-overlay');
  var started = false;
  var hlsInstance = null;

  function prepare() {
    if (started) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    prepare();
    shell.classList.add('is-playing');
    video.controls = true;
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function() {
        video.controls = true;
      });
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
