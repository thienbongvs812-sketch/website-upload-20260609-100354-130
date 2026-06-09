window.MoviePlayer = {
  init(source) {
    const video = document.getElementById('moviePlayer');
    const cover = document.getElementById('playerCover');
    const button = document.getElementById('playButton');
    let hls = null;
    let loaded = false;

    if (!video || !source) {
      return;
    }

    const load = () => {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hls.on(window.Hls.Events.ERROR, (_event, data) => {
          if (!data || !data.fatal || !hls) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
    };

    const play = () => {
      load();
      cover?.classList.add('is-hidden');
      video.play().catch(() => {});
    };

    cover?.addEventListener('click', play);
    button?.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  }
};
