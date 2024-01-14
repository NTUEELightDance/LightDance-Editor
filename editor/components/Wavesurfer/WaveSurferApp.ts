import WaveSurfer from "wavesurfer.js";
import CursorPlugin from "wavesurfer.js/src/plugin/cursor";
import regions from "wavesurfer.js/src/plugin/regions";
import MarkersPlugin from "./MarkersPlugin";

// redux
import store from "@/store";
import {
  setCurrentTime,
  setIsPlaying,
  updateLEDEffectFrameTime,
} from "@/core/actions";

import { throttle } from "throttle-debounce";
import { state } from "@/core/state";
/**
 * control 3rd party package, WaveSurfer
 */
class WaveSurferApp {
  waveSurfer: WaveSurfer;
  ready: boolean;

  constructor() {
    // @ts-expect-error waveSurfer is not initialized yet
    this.waveSurfer = null;
    this.ready = false;
  }

  /**
   * Initiate waveSurfer with CursorPlugin, TimelinePlugin
   * @function
   */
  init() {
    // create
    this.waveSurfer = WaveSurfer.create({
      container: "#waveform",
      waveColor: "#5bc1f0",
      progressColor: "#1883b5",
      cursorColor: "#edf0f1",
      responsive: true,
      backend: "MediaElement",
      plugins: [
        CursorPlugin.create({
          showTime: true,
          opacity: "1",
          color: "#edf0f1",
          customShowTimeStyle: {
            "background-color": "#000",
            color: "#fff",
            padding: "2px",
            "font-size": "10px",
          },
          hideOnBlur: true,
        }),
        regions.create({
          regionsMinLength: 0,
        }),
        MarkersPlugin.create({}),
      ],
    });

    // load music
    this.waveSurfer.load(store.getState().load.music);

    // Listener for seek event
    // waveSurfer.on("seek") will conflict
    this.addClickEvent();

    // This function is disabled considering performance issues
    // Listener when playing, which will update time
    this.waveSurfer.on(
      "audioprocess",
      throttle(1000 / 30, () => {
        this.setTimeWhenPlaying(this.getCurrentTime());
      })
    );

    this.waveSurfer.on("marker-drop", (event) => {
      if (state.editor === "LED_EDITOR") {
        updateLEDEffectFrameTime({
          payload: {
            frameIndex: event.data.frameID,
            time: Math.round(event.time * 1000),
          },
        });
      }
    });

    this.waveSurfer.on("pause", () => {
      this.setIsPlaying();
    });

    this.waveSurfer.on("play", () => {
      this.setIsPlaying();
    });

    this.ready = true;
  }

  getCurrentTime() {
    return Math.round(this.waveSurfer.getCurrentTime() * 1000);
  }

  /**
   * Play or Pause the music
   * @function
   */
  playPause() {
    this.waveSurfer.playPause();
    // Update waveSurfer time to global state
    this.setIsPlaying();
    this.setTime(this.getCurrentTime());
  }

  /**
   * Play the music
   * @function
   */
  play() {
    this.waveSurfer.play();
    this.setIsPlaying();
  }

  /**
   * Pause the music
   * @function
   */
  pause() {
    this.waveSurfer.pause();
    this.setIsPlaying();
  }

  /**
   * Play the region repeatedly
   * @function
   */
  playLoop() {
    const regions = Object.values(this.waveSurfer.regions.list);

    const region = regions.find(
      (r) =>
        this.waveSurfer.getCurrentTime() <= r.end &&
        this.waveSurfer.getCurrentTime() >= r.start
    );

    if (region) region.playLoop();
  }

  /**
   * Stop the music
   * @function
   */
  stop() {
    this.waveSurfer.stop();
    this.setIsPlaying();
    this.seekTo(this.getCurrentTime());
    this.setTime(this.getCurrentTime());
  }

  /**
   * Seek to time
   * @param {number} time
   */
  seekTo(time: number) {
    if (!this.ready) return;
    const duration = this.waveSurfer.getDuration();
    // if duration is nan, seek to 0
    const target = time / 1000 / duration;
    if (isNaN(target)) {
      this.waveSurfer.seekTo(0);
    } else {
      this.waveSurfer.seekTo(target);
    }
  }

  /**
   * click on waveform to get time by cursor
   * origin wavesurfer.on("seek", callback) will dispatch time again
   * @function
   */
  addClickEvent() {
    document
      .getElementById("waveform")
      ?.addEventListener("click", (e: MouseEvent) => {
        // From CursorPlugin Source Code
        const bbox = this.waveSurfer.container.getBoundingClientRect();
        const xpos = e.clientX - bbox.left;
        const duration = this.waveSurfer.getDuration();
        const elementWidth =
          this.waveSurfer.drawer.width / this.waveSurfer.params.pixelRatio;
        const scrollWidth = this.waveSurfer.drawer.getScrollX();

        const scrollTime =
          (duration / this.waveSurfer.drawer.width) * scrollWidth;

        const timeValue =
          Math.max(0, (xpos / elementWidth) * duration) + scrollTime;
        this.setTime(Math.round(timeValue * 1000));
      });
  }

  addRegion(start: number, end: number) {
    this.waveSurfer.addRegion({
      start: start / 1000,
      end: end / 1000,
      loop: false,
      color: "hsla(400, 100%, 30%, 0.5)",
    });
  }

  /**
   * create a new marker
   * @param { number } time  - time where marker created
   * @param { number } index - marker's label
   */
  addMarker(startSecond: number, frameID: number, draggable: boolean) {
    this.waveSurfer.addMarker({
      time: startSecond,
      color: "#8AE5C8",
      position: "top",
      draggable,
      data: {
        frameID,
      },
    });
  }

  updateMarkers(
    markerData: Array<{
      startSecond: number;
      frameID?: number;
      draggable?: boolean;
    }>
  ) {
    this.waveSurfer.clearMarkers();
    markerData.map(({ startSecond, frameID, draggable }) => {
      this.addMarker(startSecond / 1000, frameID ?? -1, !!draggable);
    });
  }

  /**
   * clear all markers
   * @function
   */
  clearMarker() {
    this.waveSurfer.clearMarkers();
  }

  toggleMarkers(showMarkers: boolean) {
    this.waveSurfer.toggleMarkers(showMarkers);
  }

  zoom(newValue: number) {
    this.waveSurfer.zoom(
      (newValue *
        (window.screen.availWidth - this.waveSurfer.params.minPxPerSec)) /
        50
    );
  }

  /**
   * set the global state
   */
  setIsPlaying() {
    setIsPlaying({
      payload: this.waveSurfer.isPlaying(),
    });
  }

  /** 
   * set playback rate
   */
  setPlaybackRate(rate: number) {
    this.waveSurfer.setPlaybackRate(rate);
  }

  /**
   * get playback rate
   */
  getPlaybackRate() {
    return this.waveSurfer.getPlaybackRate();
  }

  /**
   * set the global state
   */
  setTime(time: number) {
    setCurrentTime({
      payload: time,
      options: {
        refreshWavesurfer: false, // event from wavesurfer don't need to refresh itself
      },
    });
  }

  /**
   * set the time when playing
   */
  setTimeWhenPlaying(time: number) {
    setCurrentTime({
      payload: time,
      options: {
        states: ["currentTime"], // only update timeData, don't update reactiveState for performance
        refreshWavesurfer: false, // event from wavesurfer don't need to refresh itself
        refreshThreeSimulator: false, // they will get their own start playing
      },
    });
  }

  resize() {
    window.dispatchEvent(new Event("resize"));
  }

  setVolume(volume: number) {
    this.waveSurfer?.setVolume(volume < 0 ? 0 : volume > 1 ? 1 : volume);
  }
}

export default WaveSurferApp;

export const waveSurferAppInstance = new WaveSurferApp();
