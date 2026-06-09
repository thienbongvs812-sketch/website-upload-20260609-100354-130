(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setStatus(player, text) {
    var status = player.querySelector("[data-player-status]");
    if (status) {
      status.textContent = text;
    }
  }

  function startVideo(player) {
    var video = player.querySelector("video");
    var layer = player.querySelector(".play-layer");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    if (!stream) {
      setStatus(player, "播放暂不可用");
      return;
    }
    setStatus(player, "正在载入影片");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", stream);
      }
      var nativePlay = video.play();
      if (nativePlay && nativePlay.catch) {
        nativePlay.catch(function () {
          setStatus(player, "点击视频继续播放");
        });
      }
      if (layer) {
        layer.classList.add("is-hidden");
      }
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video.hlsReady) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          var playTask = video.play();
          if (playTask && playTask.catch) {
            playTask.catch(function () {
              setStatus(player, "点击视频继续播放");
            });
          }
        });
        hls.on(window.Hls.Events.ERROR, function () {
          setStatus(player, "播放加载中，请稍后重试");
        });
        video.hlsReady = true;
        video.hlsInstance = hls;
      } else {
        var repeatPlay = video.play();
        if (repeatPlay && repeatPlay.catch) {
          repeatPlay.catch(function () {
            setStatus(player, "点击视频继续播放");
          });
        }
      }
      if (layer) {
        layer.classList.add("is-hidden");
      }
      return;
    }
    video.setAttribute("src", stream);
    var fallbackPlay = video.play();
    if (fallbackPlay && fallbackPlay.catch) {
      fallbackPlay.catch(function () {
        setStatus(player, "此设备暂不支持当前播放格式");
      });
    }
    if (layer) {
      layer.classList.add("is-hidden");
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var button = player.querySelector(".play-layer");
      var video = player.querySelector("video");
      if (button) {
        button.addEventListener("click", function () {
          startVideo(player);
        });
      }
      if (video) {
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
          setStatus(player, "正在播放");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            setStatus(player, "已暂停");
          }
        });
        video.addEventListener("ended", function () {
          setStatus(player, "播放结束");
        });
      }
    });
  });
})();
