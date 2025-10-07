import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";

import Button from "./Button";
import VideoPreview from "./VideoPreview";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  const totalVideos = 4;
  const nextVdRef = useRef(null);

  const handleVideoLoad = () => {
    setLoadedVideos((prev) => prev + 1);
  };

  useEffect(() => {
    if (loadedVideos === totalVideos - 1) {
      setLoading(false);
    }
  }, [loadedVideos]);

  const handleMiniVdClick = () => {
    setHasClicked(true);

    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  const handleTimeUpdate = (event) => {
    const videoElement = event.target;
    const duration = videoElement.duration || 0;
    if (duration > 0 && videoElement.currentTime >= duration / 2) {
      // Loop the first half for faster perceived loads
      videoElement.currentTime = 0;
    }
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => nextVdRef.current.play(),
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    {
      dependencies: [currentIndex],
      revertOnUpdate: true,
    }
  );

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  const getVideoSrc = (index) => `videos/hero-${index}.mp4`;

  // Ensure mobile autoplay compatibility (iOS Safari requires playsInline + user gesture fallback)
  useEffect(() => {
    const ensureInlineAutoplay = () => {
      const videos = document.querySelectorAll('#video-frame video');
      videos.forEach((video) => {
        try {
          video.muted = true;
          // playsInline for iOS Safari
          video.setAttribute('playsinline', '');
          // Some engines also look for this property
          // @ts-ignore - not in standard DOM typings
          video.playsInline = true;
        } catch {}
      });
    };

    const tryPlayAll = () => {
      const videos = document.querySelectorAll('#video-frame video');
      videos.forEach((video) => {
        try {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
          }
        } catch {}
      });
    };

    ensureInlineAutoplay();

    // Attempt to play immediately (muted inline should succeed on most browsers)
    tryPlayAll();

    // As a fallback, retry on first user interaction
    const onFirstInteract = () => {
      tryPlayAll();
      window.removeEventListener('touchstart', onFirstInteract);
      window.removeEventListener('click', onFirstInteract);
    };
    window.addEventListener('touchstart', onFirstInteract, { once: true });
    window.addEventListener('click', onFirstInteract, { once: true });

    return () => {
      window.removeEventListener('touchstart', onFirstInteract);
      window.removeEventListener('click', onFirstInteract);
    };
  }, []);

  // Only play videos when they are in view to conserve battery/network
  useEffect(() => {
    const videos = Array.from(document.querySelectorAll('#video-frame video'));
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          try {
            if (entry.isIntersecting) {
              const p = video.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            } else {
              video.pause();
            }
          } catch {}
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.2 }
    );

    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50">
          {/* https://uiverse.io/G4b413l/tidy-walrus-92 */}
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75"
      >
        <div>
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <VideoPreview>
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
              >
                <video
                  ref={nextVdRef}
                  src={getVideoSrc((currentIndex % totalVideos) + 1)}
                  loop
                  muted
                  id="current-video"
                  className="size-64 origin-center scale-150 object-cover object-center"
                  onLoadedData={handleVideoLoad}
                  onTimeUpdate={handleTimeUpdate}
                  playsInline
                  preload="metadata"
                />
              </div>
            </VideoPreview>
          </div>

          <video
            ref={nextVdRef}
            src={getVideoSrc(currentIndex)}
            loop
            muted
            id="next-video"
            className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
            onLoadedData={handleVideoLoad}
            onTimeUpdate={handleTimeUpdate}
            playsInline
            preload="metadata"
          />
          <video
            src={getVideoSrc(
              currentIndex === totalVideos - 1 ? 1 : currentIndex
            )}
            autoPlay
            loop
            muted
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoadedData={handleVideoLoad}
            onTimeUpdate={handleTimeUpdate}
            playsInline
            preload="metadata"
            poster="img/entrance.webp"
          />
        </div>

        <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75">
          D<b>E</b>VELOPER
        </h1>

        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-24 px-5 sm:px-10">
            <h1 className="special-font hero-heading text-blue-100">
              Hi, I&#39;m <b>H</b>assan
            </h1>

            <p className="mb-5 max-w-64 font-robert-regular text-blue-100">
              Front‑end developer crafting immersive, animated web experiences.
              <br /> Explore my latest work below.
            </p>

            <Button
              id="view-projects"
              title="View projects"
              leftIcon={<TiLocationArrow />}
              containerClass="bg-yellow-300 flex-center gap-1"
            />
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading absolute bottom-5 right-5 text-black">
        D<b>E</b>VELOPER
      </h1>
    </div>
  );
};

export default Hero;
