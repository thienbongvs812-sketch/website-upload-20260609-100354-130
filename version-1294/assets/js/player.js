(function () {
    function whenReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function attach(video, stream) {
        if (video.getAttribute("data-ready") === "1") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }

        video.setAttribute("data-ready", "1");
    }

    window.MoviePlayer = {
        init: function (selector, stream) {
            whenReady(function () {
                var shell = document.querySelector(selector);

                if (!shell) {
                    return;
                }

                var video = shell.querySelector("video");
                var cover = shell.querySelector(".play-cover");

                if (!video || !cover) {
                    return;
                }

                cover.addEventListener("click", function () {
                    attach(video, stream);
                    cover.classList.add("is-hidden");
                    var request = video.play();

                    if (request && typeof request.catch === "function") {
                        request.catch(function () {
                            cover.classList.remove("is-hidden");
                        });
                    }
                });

                video.addEventListener("play", function () {
                    cover.classList.add("is-hidden");
                });
            });
        }
    };
})();
