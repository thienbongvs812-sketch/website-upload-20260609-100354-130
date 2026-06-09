(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  }

  function attachPlayer(frame) {
    var video = frame.querySelector("video");
    var button = frame.querySelector(".play-overlay");
    var stream = frame.getAttribute("data-stream");
    var hls = null;
    var attached = false;

    if (!video || !stream) {
      return;
    }

    function bindStream() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 60
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function playVideo() {
      bindStream();

      if (button) {
        button.classList.add("is-hidden");
      }

      var request = video.play();

      if (request && request.catch) {
        request.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    bindStream();

    if (button) {
      button.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(attachPlayer);
  });
})();
