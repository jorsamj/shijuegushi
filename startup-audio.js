(() => {
  "use strict";

  const INTRO_AUDIO_SRC = "assets/library/audio/external/processed/amb_rain_window_real_01.ogg";
  const INTRO_TARGET_VOLUME = 0.032;
  const INTRO_FADE_IN_MS = 900;
  const INTRO_FADE_OUT_MS = 700;

  let introAudio = null;
  let animationFrame = 0;
  let stopping = false;

  function audioIsEnabled() {
    try {
      const settings = JSON.parse(localStorage.getItem("mist.settings") || "{}");
      return settings.audioEnabled !== false;
    } catch (error) {
      return true;
    }
  }

  function cancelFade() {
    if (!animationFrame) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function fadeVolume(audio, targetVolume, durationMs, onComplete) {
    if (!audio) return;
    cancelFade();
    const startVolume = Number(audio.volume || 0);
    const startedAt = performance.now();
    const duration = Math.max(1, Number(durationMs || 0));

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      audio.volume = startVolume + (targetVolume - startVolume) * progress;
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
        return;
      }
      animationFrame = 0;
      onComplete?.();
    };

    animationFrame = requestAnimationFrame(tick);
  }

  function ensureIntroAudio() {
    if (introAudio) return introAudio;
    introAudio = new Audio(INTRO_AUDIO_SRC);
    introAudio.loop = true;
    introAudio.preload = "auto";
    introAudio.volume = 0;
    introAudio.setAttribute("playsinline", "");
    introAudio.setAttribute("webkit-playsinline", "");
    introAudio.addEventListener("error", () => {
      console.warn("[Second Life] Startup ambience could not be loaded.");
    });
    return introAudio;
  }

  function startIntroAudio() {
    if (!audioIsEnabled() || stopping) return;
    const audio = ensureIntroAudio();
    if (!audio.paused) return;
    const playPromise = audio.play();
    if (playPromise?.then) {
      playPromise
        .then(() => fadeVolume(audio, INTRO_TARGET_VOLUME, INTRO_FADE_IN_MS))
        .catch(() => {
          // Mobile browsers may reject playback until a direct user gesture.
        });
    }
  }

  function stopIntroAudio(durationMs = INTRO_FADE_OUT_MS) {
    if (!introAudio || introAudio.paused || stopping) return;
    stopping = true;
    fadeVolume(introAudio, 0, durationMs, () => {
      try {
        introAudio.pause();
        introAudio.currentTime = 0;
      } catch (error) {}
      stopping = false;
    });
  }

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest?.(".splash-screen")) startIntroAudio();
    },
    { capture: true }
  );

  document.addEventListener(
    "click",
    (event) => {
      if (event.target.closest?.("[data-action='enter-hall']")) {
        startIntroAudio();
        return;
      }
      if (event.target.closest?.("[data-action='start-script'], [data-action='restart-script']")) {
        stopIntroAudio();
      }
    },
    true
  );

  const app = document.getElementById("app");
  if (app) {
    const observer = new MutationObserver(() => {
      if (app.querySelector(".game-screen, .ending-screen")) stopIntroAudio();
    });
    observer.observe(app, { childList: true, subtree: true });
  }

  window.addEventListener("pagehide", () => stopIntroAudio(120));
  window.SECOND_LIFE_STARTUP_AUDIO = {
    start: startIntroAudio,
    stop: stopIntroAudio,
  };
})();
