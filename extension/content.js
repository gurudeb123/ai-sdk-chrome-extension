/**
 * Page Summarizer Extension
 * This extension was built by Claude Code and OpenAI Codex with GPT-5 (High)
 */

(function () {
  "use strict";

  // ============================================================================
  // Configuration Module
  // ============================================================================
  const CONFIG = {
    EXTENSION_ID: "page-summarizer-extension",
    // API_ENDPOINT: 'https://your-deployment.vercel.app/api/summarize',
    API_ENDPOINT: "http://localhost:3000/api/summarize", // for local dev!

    BLOCKED_DOMAINS: [
      "github.com",
      "google.com",
      "youtube.com",
      "twitter.com",
      "x.com",
      "facebook.com",
      "instagram.com",
      "linkedin.com",
      "reddit.com",
      "gmail.com",
      "outlook.com",
      "netflix.com",
      "spotify.com",
      "amazon.com",
      "ebay.com",
    ],

    AUDIO: {
      SKIP_SECONDS: 10,
      WAVEFORM: {
        BAR_WIDTH: 2,
        BAR_GAP: 1,
        MIN_HEIGHT_PCT: 6,
        MAX_BARS: 320,
        MIN_BARS: 60,
      },
    },

    EVENTS: {
      TOGGLE: "page-summarizer-toggle",
    },
  };

  // Generate CSS class names
  const CSS = {
    player: `${CONFIG.EXTENSION_ID}-player`,
    disabled: `${CONFIG.EXTENSION_ID}-disabled`,
    entering: `${CONFIG.EXTENSION_ID}-entering`,
    surface: `${CONFIG.EXTENSION_ID}-surface`,
    waveform: `${CONFIG.EXTENSION_ID}-waveform`,
    waveformLayer: `${CONFIG.EXTENSION_ID}-waveform-layer`,
    waveformBase: `${CONFIG.EXTENSION_ID}-waveform-base`,
    waveformOverlay: `${CONFIG.EXTENSION_ID}-waveform-overlay`,
    timeDisplay: `${CONFIG.EXTENSION_ID}-time-display`,
    currentTime: `${CONFIG.EXTENSION_ID}-current-time`,
    remaining: `${CONFIG.EXTENSION_ID}-remaining`,
    controls: `${CONFIG.EXTENSION_ID}-controls`,
    controlsGroup: `${CONFIG.EXTENSION_ID}-controls-group`,
    control: `${CONFIG.EXTENSION_ID}-control`,
    playPause: `${CONFIG.EXTENSION_ID}-play-pause`,
    playIcon: `${CONFIG.EXTENSION_ID}-play-icon`,
    pauseIcon: `${CONFIG.EXTENSION_ID}-pause-icon`,
    overlayButton: `${CONFIG.EXTENSION_ID}-overlay-button`,
    brandLeft: `${CONFIG.EXTENSION_ID}-brand-left`,
    brandRight: `${CONFIG.EXTENSION_ID}-brand-right`,
    spinner: `${CONFIG.EXTENSION_ID}-spinner`,
  };

  // ============================================================================
  // DOM Utilities Module
  // ============================================================================
  const DOMUtils = {
    findFirstHeading() {
      return document.querySelector("h1") || document.querySelector("h2");
    },

    extractPageText() {
      const body = document.body.cloneNode(true);

      // Remove unwanted elements
      const excludedSelectors = `script, style, noscript, [class*="${CONFIG.EXTENSION_ID}"]`;
      body.querySelectorAll(excludedSelectors).forEach((el) => el.remove());

      return body.innerText || body.textContent || "";
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },

    isDomainBlocked(hostname) {
      const domain = hostname.replace("www.", "");
      return CONFIG.BLOCKED_DOMAINS.some((blocked) => domain.includes(blocked));
    },
  };

  // ============================================================================
  // UI Components Module
  // ============================================================================
  const UIComponents = {
    createPlayerHTML() {
      return `
        <audio id="${CONFIG.EXTENSION_ID}-audio" preload="auto" playsinline></audio>

        <div class="${CSS.surface}">
          <div class="${CSS.waveform}"></div>
          <div class="${CSS.timeDisplay}">
            <span class="${CSS.currentTime}">0:00</span>
            <span class="${CSS.remaining}">-0:00</span>
          </div>
        </div>

        <div class="${CSS.controls}">
          ${this.createBrandLeft()}
          ${this.createControlsGroup()}
          ${this.createBrandRight()}
        </div>

        ${this.createOverlayButton()}
      `;
    },

    createBrandLeft() {
      return `
        <span class="${CSS.brandLeft}" aria-label="Vercel">
          <svg fill="currentColor" width="800px" height="800px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
            <path d="M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z M 15.3438 28.7852 C 15.7891 28.7852 16.0938 28.5039 16.1406 28.0821 C 16.9844 21.8242 17.1953 21.8242 23.6641 20.5821 C 24.0860 20.5117 24.3906 20.2305 24.3906 19.7852 C 24.3906 19.3633 24.0860 19.0586 23.6641 18.9883 C 17.1953 18.0977 16.9609 17.8867 16.1406 11.5117 C 16.0938 11.0899 15.7891 10.7852 15.3438 10.7852 C 14.9219 10.7852 14.6172 11.0899 14.5703 11.5352 C 13.7969 17.8164 13.4687 17.7930 7.0469 18.9883 C 6.6250 19.0821 6.3203 19.3633 6.3203 19.7852 C 6.3203 20.2539 6.6250 20.5117 7.1406 20.5821 C 13.5156 21.6133 13.7969 21.7774 14.5703 28.0352 C 14.6172 28.5039 14.9219 28.7852 15.3438 28.7852 Z M 31.2344 54.7305 C 31.8438 54.7305 32.2891 54.2852 32.4062 53.6524 C 34.0703 40.8086 35.8750 38.8633 48.5781 37.4570 C 49.2344 37.3867 49.6797 36.8945 49.6797 36.2852 C 49.6797 35.6758 49.2344 35.2070 48.5781 35.1133 C 35.8750 33.7070 34.0703 31.7617 32.4062 18.9180 C 32.2891 18.2852 31.8438 17.8633 31.2344 17.8633 C 30.6250 17.8633 30.1797 18.2852 30.0860 18.9180 C 28.4219 31.7617 26.5938 33.7070 13.9140 35.1133 C 13.2344 35.2070 12.7891 35.6758 12.7891 36.2852 C 12.7891 36.8945 13.2344 37.3867 13.9140 37.4570 C 26.5703 39.1211 28.3281 40.8321 30.0860 53.6524 C 30.1797 54.2852 30.6250 54.7305 31.2344 54.7305 Z"/>
          </svg>
          AI SDK
        </span>
      `;
    },

    createBrandRight() {
      return `
        <span class="${CSS.brandRight}" aria-label="ElevenLabs">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 694 90" fill="none" role="img" focusable="false">
            <path d="M248.261 22.1901H230.466L251.968 88.5124H271.123L292.625 22.1901H274.83L261.365 72.1488L248.261 22.1901Z" fill="currentColor"/>
            <path d="M0 0H18.413V88.5124H0V0Z" fill="currentColor"/>
            <path d="M36.5788 0H54.9917V88.5124H36.5788V0Z" fill="currentColor"/>
            <path d="M73.1551 0H127.652V14.7521H91.568V35.8264H125.181V50.5785H91.568V73.7603H127.652V88.5124H73.1551V0Z" fill="currentColor"/>
            <path d="M138.896 0H156.32V88.5124H138.896V0Z" fill="currentColor"/>
            <path d="M166.824 55.2893C166.824 31.1157 178.811 20.7025 197.471 20.7025C216.131 20.7025 226.759 30.9917 226.759 55.5372V59.5041H184.001C184.619 73.8843 188.944 78.719 197.224 78.719C203.773 78.719 207.851 74.876 208.593 68.1818H226.017C224.905 82.8099 212.795 90 197.224 90C177.452 90 166.824 79.4628 166.824 55.2893ZM209.582 47.9752C208.717 35.8264 204.515 31.8595 197.224 31.8595C189.933 31.8595 185.36 35.9504 184.125 47.9752H209.582Z" fill="currentColor"/>
            <path d="M295.962 55.2893C295.962 31.1157 307.949 20.7025 326.609 20.7025C345.269 20.7025 355.897 30.9917 355.897 55.5372V59.5041H313.139C313.757 73.8843 318.082 78.719 326.362 78.719C332.911 78.719 336.989 74.876 337.731 68.1818H355.155C354.043 82.8099 341.932 90 326.362 90C306.589 90 295.962 79.4628 295.962 55.2893ZM338.719 47.9752C337.854 35.8264 333.653 31.8595 326.362 31.8595C319.071 31.8595 314.498 35.9504 313.263 47.9752H338.719Z" fill="currentColor"/>
            <path d="M438.443 0H456.856V73.7603H491.457V88.5124H438.443V0Z" fill="currentColor"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M495.783 55.2893C495.783 30 507.399 20.7025 522.352 20.7025C529.766 20.7025 536.563 24.9174 539.282 29.3802V22.1901H557.077V88.5124H539.776V80.7025C537.181 85.9091 529.89 90 521.857 90C506.04 90 495.783 79.8347 495.783 55.2893ZM526.924 33.719C535.574 33.719 540.27 40.2893 540.27 55.2893C540.27 70.2893 535.574 76.9835 526.924 76.9835C518.274 76.9835 513.331 70.2893 513.331 55.2893C513.331 40.2893 518.274 33.719 526.924 33.719Z" fill="currentColor"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M587.847 80.7025V88.5124H570.547V0H587.971V29.3802C590.937 24.7934 597.857 20.7025 605.272 20.7025C619.854 20.7025 631.47 30 631.47 55.2893C631.47 80.5785 620.101 90 604.901 90C596.869 90 590.319 85.9091 587.847 80.7025ZM600.329 33.843C608.979 33.843 613.922 40.2893 613.922 55.2893C613.922 70.2893 608.979 76.9835 600.329 76.9835C591.678 76.9835 586.982 70.2893 586.982 55.2893C586.982 40.2893 591.678 33.843 600.329 33.843Z" fill="currentColor"/>
            <path d="M638.638 68.8017H656.062C656.309 75.7438 660.016 79.0909 666.566 79.0909C673.115 79.0909 676.823 76.1157 676.823 70.9091C676.823 66.1983 673.981 64.4628 667.802 62.9752L662.488 61.6116C647.412 57.7686 639.873 53.6777 639.873 41.157C639.873 28.6364 651.49 20.7025 666.319 20.7025C681.148 20.7025 692.394 26.5289 692.888 40.2893H675.463C675.093 34.2149 671.385 31.6116 666.072 31.6116C660.758 31.6116 657.05 34.2149 657.05 39.1736C657.05 43.7603 660.016 45.4959 665.207 46.7355L670.644 48.0992C684.979 51.6942 694 55.2893 694 68.6777C694 82.0661 682.137 90 666.072 90C648.647 90 639.008 83.4297 638.638 68.8017Z" fill="currentColor"/>
            <path d="M384.072 49.4628C384.072 39.0496 389.015 33.3471 396.677 33.3471C402.979 33.3471 406.563 37.314 406.563 45.8678V88.5124H423.987V43.1405C423.987 27.7686 415.337 20.7025 402.732 20.7025C394.205 20.7025 387.162 25.0413 384.072 30.7438V22.1901H366.401V88.5124H384.072V49.4628Z" fill="currentColor"/>
          </svg>
        </span>
      `;
    },

    createControlsGroup() {
      return `
        <div class="${CSS.controlsGroup}">
          <button class="${CSS.control}" data-action="rewind" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m10 5-7 7 7 7v-6.5c5 0 8.5 1.5 11 5.5-1-5-4-10-11-11V5z"/>
            </svg>
          </button>
          <button class="${CSS.control} ${CSS.playPause}" data-action="play" disabled>
            <svg class="${CSS.playIcon}" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4v16l14-8z"/>
            </svg>
            <svg class="${CSS.pauseIcon}" style="display:none;" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
          <button class="${CSS.control}" data-action="forward" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m14 5 7 7-7 7v-6.5c-5 0-8.5 1.5-11 5.5 1-5 4-10 11-11V5z"/>
            </svg>
          </button>
        </div>
      `;
    },

    createOverlayButton() {
      return `
        <button class="${CSS.overlayButton}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
            <path d="M20 2v4"/>
            <path d="M22 4h-4"/>
            <circle cx="4" cy="20" r="2"/>
          </svg>
          <span>Generate trailer</span>
        </button>
      `;
    },

    createLoadingSpinner() {
      return `
        <svg class="${CSS.spinner}" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Generating...</span>
      `;
    },

    createErrorState() {
      return `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4m0 4h.01"/>
        </svg>
        <span>Error - Try Again</span>
      `;
    },
  };

  // ============================================================================
  // API Service Module
  // ============================================================================
  const ApiService = {
    async requestSummary(text, url, title) {
      console.log("Requesting summary for:", {
        url,
        title,
        textLength: text.length,
      });

      try {
        const response = await fetch(CONFIG.API_ENDPOINT, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, url, title }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        console.log("Audio received:", {
          size: audioBlob.size,
          type: audioBlob.type,
        });

        return this.createAudioUrl(audioBlob);
      } catch (error) {
        console.error("Summary request failed:", error);
        throw error;
      }
    },

    createAudioUrl(audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve, reject) => {
        const testAudio = new Audio(audioUrl);

        testAudio.addEventListener("loadedmetadata", () => {
          console.log("Audio verified, duration:", testAudio.duration);
          resolve(audioUrl);
        });

        testAudio.addEventListener("error", (error) => {
          console.error("Audio loading failed:", error);
          URL.revokeObjectURL(audioUrl);
          reject(new Error("Failed to load audio"));
        });
      });
    },
  };

  // ============================================================================
  // Audio Player Class
  // ============================================================================
  class AudioPlayer {
    constructor(container) {
      this.container = container;
      this.audioElement = container.querySelector(
        `#${CONFIG.EXTENSION_ID}-audio`,
      );
      this.audioContext = null;
      this.audioUrl = null;
      this.rafId = null;
      this.lastDisplayedSec = -1;
    }

    async loadAudio(audioUrl, autoplay = false) {
      this.audioUrl = audioUrl;
      this.audioElement.src = audioUrl;
      this.setupEventListeners();
      await this.renderWaveform();

      if (autoplay) {
        this.play();
      }
    }

    setupEventListeners() {
      this.audioElement.addEventListener("play", () => this.onPlay());
      this.audioElement.addEventListener("pause", () => this.onPause());
      this.audioElement.addEventListener("ended", () => this.onEnded());
      this.audioElement.addEventListener("loadedmetadata", () =>
        this.onMetadataLoaded(),
      );
    }

    async play() {
      try {
        await this.audioElement.play();
        return true;
      } catch (error) {
        console.warn("Playback failed:", error);
        return false;
      }
    }

    pause() {
      this.audioElement.pause();
    }

    togglePlayPause() {
      if (this.audioElement.paused) {
        this.play();
      } else {
        this.pause();
      }
    }

    skip(seconds) {
      this.audioElement.currentTime += seconds;
    }

    seekToPercent(percent) {
      if (this.audioElement.duration > 0) {
        this.audioElement.currentTime = percent * this.audioElement.duration;
        this.updateProgress();
      }
    }

    onPlay() {
      this.updatePlayButton(true);
      this.startProgressAnimation();
    }

    onPause() {
      this.updatePlayButton(false);
      this.stopProgressAnimation();
    }

    onEnded() {
      this.updatePlayButton(false);
      this.stopProgressAnimation();
    }

    onMetadataLoaded() {
      const remainingSpan = this.container.querySelector(`.${CSS.remaining}`);
      if (remainingSpan) {
        remainingSpan.textContent = `-${DOMUtils.formatTime(this.audioElement.duration)}`;
      }
    }

    updatePlayButton(isPlaying) {
      const button = this.container.querySelector(`.${CSS.playPause}`);
      if (!button) return;

      const playIcon = button.querySelector(`.${CSS.playIcon}`);
      const pauseIcon = button.querySelector(`.${CSS.pauseIcon}`);

      if (playIcon && pauseIcon) {
        playIcon.style.display = isPlaying ? "none" : "block";
        pauseIcon.style.display = isPlaying ? "block" : "none";
      }
    }

    updateProgress() {
      const current = this.audioElement.currentTime || 0;
      const duration = this.audioElement.duration || 0;

      if (duration > 0) {
        const overlay = this.container.querySelector(`.${CSS.waveformOverlay}`);
        if (overlay) {
          overlay.style.width = `${(current / duration) * 100}%`;
        }
      }

      const wholeSec = Math.floor(current);
      if (wholeSec !== this.lastDisplayedSec) {
        this.lastDisplayedSec = wholeSec;

        const currentTimeSpan = this.container.querySelector(
          `.${CSS.currentTime}`,
        );
        const remainingSpan = this.container.querySelector(`.${CSS.remaining}`);

        if (currentTimeSpan) {
          currentTimeSpan.textContent = DOMUtils.formatTime(current);
        }
        if (remainingSpan && duration > 0) {
          remainingSpan.textContent = `-${DOMUtils.formatTime(Math.max(0, duration - current))}`;
        }
      }
    }

    startProgressAnimation() {
      this.stopProgressAnimation();

      const tick = () => {
        if (!this.audioElement || this.audioElement.paused) return;
        this.updateProgress();
        this.rafId = requestAnimationFrame(tick);
      };

      this.rafId = requestAnimationFrame(tick);
    }

    stopProgressAnimation() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    async renderWaveform() {
      const waveformEl = this.container.querySelector(`.${CSS.waveform}`);
      if (!waveformEl || !this.audioUrl) return;

      try {
        if (!this.audioContext) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.audioContext = new AudioContext();
        }

        const rect = waveformEl.getBoundingClientRect();
        const maxBars = Math.min(
          CONFIG.AUDIO.WAVEFORM.MAX_BARS,
          Math.max(
            CONFIG.AUDIO.WAVEFORM.MIN_BARS,
            Math.floor(
              rect.width /
                (CONFIG.AUDIO.WAVEFORM.BAR_WIDTH +
                  CONFIG.AUDIO.WAVEFORM.BAR_GAP),
            ),
          ),
        );

        const response = await fetch(this.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer =
          await this.audioContext.decodeAudioData(arrayBuffer);

        const peaks = this.extractPeaks(audioBuffer, maxBars);
        const barsHtml = this.generateWaveformBars(peaks);

        waveformEl.innerHTML = `
          <div class="${CSS.waveformLayer} ${CSS.waveformBase}">${barsHtml}</div>
          <div class="${CSS.waveformLayer} ${CSS.waveformOverlay}">${barsHtml}</div>
        `;

        this.updateProgress();
      } catch (error) {
        console.error("Failed to render waveform:", error);
        this.renderPlaceholderWaveform();
      }
    }

    renderPlaceholderWaveform() {
      const waveformEl = this.container.querySelector(`.${CSS.waveform}`);
      if (!waveformEl) return;

      const rect = waveformEl.getBoundingClientRect();
      const count = Math.max(
        60,
        Math.min(
          320,
          Math.floor(
            rect.width /
              (CONFIG.AUDIO.WAVEFORM.BAR_WIDTH + CONFIG.AUDIO.WAVEFORM.BAR_GAP),
          ),
        ),
      );

      const bars = [];
      for (let i = 0; i < count; i++) {
        const t = count <= 1 ? 0 : i / (count - 1);
        const tri = 1 - Math.abs(2 * t - 1);
        const pct = Math.max(
          CONFIG.AUDIO.WAVEFORM.MIN_HEIGHT_PCT,
          Math.round(tri * 100),
        );
        bars.push(`<span style="height:${pct}%"></span>`);
      }

      const barsHtml = bars.join("");
      waveformEl.innerHTML = `
        <div class="${CSS.waveformLayer} ${CSS.waveformBase}">${barsHtml}</div>
        <div class="${CSS.waveformLayer} ${CSS.waveformOverlay}" style="width:0%">${barsHtml}</div>
      `;
    }

    extractPeaks(audioBuffer, barCount) {
      const { length, numberOfChannels } = audioBuffer;
      const samplesPerBar = Math.floor(length / barCount);
      const channels = [];

      for (let c = 0; c < numberOfChannels; c++) {
        channels.push(audioBuffer.getChannelData(c));
      }

      const peaks = new Array(barCount).fill(0);

      for (let i = 0; i < barCount; i++) {
        const start = i * samplesPerBar;
        const end = i === barCount - 1 ? length : start + samplesPerBar;
        let sumSq = 0;
        let count = 0;

        for (let s = start; s < end; s += 64) {
          let v = 0;
          for (let c = 0; c < numberOfChannels; c++) {
            v += channels[c][s] || 0;
          }
          v /= numberOfChannels;
          sumSq += v * v;
          count++;
        }

        const rms = count ? Math.sqrt(sumSq / count) : 0;
        peaks[i] = rms;
      }

      return this.normalizePeaks(peaks);
    }

    normalizePeaks(peaks) {
      const max = Math.max(1e-6, Math.max(...peaks));
      const normalized = peaks.map((p) => Math.pow(p / max, 0.5));

      const smoothed = new Array(normalized.length);
      for (let i = 0; i < normalized.length; i++) {
        const a = normalized[i - 1] ?? normalized[i];
        const b = normalized[i];
        const c = normalized[i + 1] ?? normalized[i];
        smoothed[i] = (a + 2 * b + c) / 4;
      }

      return smoothed;
    }

    generateWaveformBars(peaks) {
      return peaks
        .map((value) => {
          const pct = Math.max(
            CONFIG.AUDIO.WAVEFORM.MIN_HEIGHT_PCT,
            Math.min(100, Math.round(value * 100)),
          );
          return `<span style="height:${pct}%"></span>`;
        })
        .join("");
    }

    destroy() {
      this.stopProgressAnimation();
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = "";
      }
      if (this.audioUrl) {
        URL.revokeObjectURL(this.audioUrl);
        this.audioUrl = null;
      }
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    }
  }

  // ============================================================================
  // Main Page Summarizer Class
  // ============================================================================
  class PageSummarizer {
    constructor() {
      this.isInitialized = false;
      this.playerContainer = null;
      this.targetHeading = null;
      this.audioPlayer = null;
      this.shouldAutoplay = false;
      this.removalObserver = null;
    }

    init() {
      if (this.isInitialized) return;

      if (DOMUtils.isDomainBlocked(window.location.hostname)) {
        console.log(`Page Summarizer: Disabled on ${window.location.hostname}`);
        return;
      }

      this.isInitialized = true;

      const heading = DOMUtils.findFirstHeading();
      if (heading) {
        this.targetHeading = heading;
        this.injectPlayer(heading);
        this.observeRemoval();
      }
    }

    injectPlayer(heading) {
      if (heading.nextElementSibling?.classList.contains(CSS.player)) {
        this.playerContainer = heading.nextElementSibling;
        return;
      }

      this.playerContainer = document.createElement("div");
      this.playerContainer.className = `${CSS.player} ${CSS.disabled} ${CSS.entering}`;
      this.playerContainer.setAttribute(
        "data-extension-id",
        CONFIG.EXTENSION_ID,
      );
      this.playerContainer.innerHTML = UIComponents.createPlayerHTML();

      heading.insertAdjacentElement("afterend", this.playerContainer);

      requestAnimationFrame(() => {
        this.playerContainer.classList.remove(CSS.entering);
      });

      this.attachEventListeners();
      this.audioPlayer = new AudioPlayer(this.playerContainer);
      this.audioPlayer.renderPlaceholderWaveform();
    }

    attachEventListeners() {
      const overlayButton = this.playerContainer.querySelector(
        `.${CSS.overlayButton}`,
      );
      if (overlayButton) {
        overlayButton.addEventListener("click", (e) => this.handleSummarize(e));
      }

      const playPauseBtn = this.playerContainer.querySelector(
        '[data-action="play"]',
      );
      const rewindBtn = this.playerContainer.querySelector(
        '[data-action="rewind"]',
      );
      const forwardBtn = this.playerContainer.querySelector(
        '[data-action="forward"]',
      );

      if (playPauseBtn) {
        playPauseBtn.addEventListener("click", () =>
          this.audioPlayer?.togglePlayPause(),
        );
      }
      if (rewindBtn) {
        rewindBtn.addEventListener("click", () =>
          this.audioPlayer?.skip(-CONFIG.AUDIO.SKIP_SECONDS),
        );
      }
      if (forwardBtn) {
        forwardBtn.addEventListener("click", () =>
          this.audioPlayer?.skip(CONFIG.AUDIO.SKIP_SECONDS),
        );
      }

      const waveform = this.playerContainer.querySelector(`.${CSS.waveform}`);
      if (waveform) {
        waveform.addEventListener("click", (e) => this.handleWaveformClick(e));
      }
    }

    handleWaveformClick(event) {
      if (!this.audioPlayer) return;

      const waveform = event.currentTarget;
      const rect = waveform.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;

      this.audioPlayer.seekToPercent(percent);
    }

    async handleSummarize(event) {
      const button = event.currentTarget;
      this.shouldAutoplay = true;

      button.disabled = true;
      button.innerHTML = UIComponents.createLoadingSpinner();

      try {
        const pageText = DOMUtils.extractPageText();
        console.log("Page text extracted, length:", pageText.length);

        const audioUrl = await ApiService.requestSummary(
          pageText,
          window.location.href,
          document.title,
        );

        if (audioUrl) {
          await this.activatePlayer(audioUrl);
        }
      } catch (error) {
        console.error("Summarization failed:", error);
        button.innerHTML = UIComponents.createErrorState();
        button.disabled = false;
      }
    }

    async activatePlayer(audioUrl) {
      this.playerContainer.classList.remove(CSS.disabled);

      const overlayButton = this.playerContainer.querySelector(
        `.${CSS.overlayButton}`,
      );
      if (overlayButton) {
        overlayButton.remove();
      }

      const controls = this.playerContainer.querySelectorAll(`.${CSS.control}`);
      controls.forEach((control) => (control.disabled = false));

      await this.audioPlayer.loadAudio(audioUrl, this.shouldAutoplay);
      this.shouldAutoplay = false;
    }

    observeRemoval() {
      this.removalObserver = new MutationObserver((mutations) => {
        if (
          this.playerContainer &&
          !document.body.contains(this.playerContainer)
        ) {
          console.log("Player was removed, re-injecting...");

          if (
            this.targetHeading &&
            document.body.contains(this.targetHeading)
          ) {
            this.injectPlayer(this.targetHeading);
          } else {
            this.targetHeading = DOMUtils.findFirstHeading();
            if (this.targetHeading) {
              this.injectPlayer(this.targetHeading);
            }
          }
        }
      });

      this.removalObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    toggle() {
      if (
        this.playerContainer &&
        document.body.contains(this.playerContainer)
      ) {
        this.destroy();
      } else {
        this.init();
      }
    }

    destroy() {
      if (this.audioPlayer) {
        this.audioPlayer.destroy();
        this.audioPlayer = null;
      }

      if (this.playerContainer) {
        this.playerContainer.remove();
        this.playerContainer = null;
      }

      if (this.removalObserver) {
        this.removalObserver.disconnect();
        this.removalObserver = null;
      }

      this.targetHeading = null;
      this.isInitialized = false;
    }
  }

  // ============================================================================
  // Initialize Extension
  // ============================================================================
  const pageSummarizer = new PageSummarizer();

  // Listen for toggle event from background script
  window.addEventListener(CONFIG.EVENTS.TOGGLE, () => {
    pageSummarizer.toggle();
  });

  // Initialize on injection
  pageSummarizer.init();
})();
