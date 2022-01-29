import WaveSurfer from "wavesurfer.js";
import CursorPlugin from "wavesurfer.js/src/plugin/cursor";
import regions from "wavesurfer.js/src/plugin/regions";
import MarkersPlugin from "wavesurfer.js/src/plugin/markers";

// redux
import store from "../../store";
import { playPause, setTime } from "../../slices/globalSlice";

// constant
import { WAVESURFERAPP } from "../../constants";
import { getItem } from "../../utils/localStorage";

// types
import { LocalRegion, Region } from "../../types/components/wavesurfer";

import { ControlMapElement } from "../../types/globalSlice";
/**
 * control 3rd party package, WaveSurfer
 */

class WaveSurferApp {
  waveSurfer: any;
  from: string;
  ready: boolean;

  constructor() {
    this.waveSurfer = null;
    this.from = WAVESURFERAPP;
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
      // height: screen.height * 0.08,
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
        }),
        regions.create({
          regionsMinLength: 0,
        }),
        MarkersPlugin.create({
          markers: [
            {
              time: 0,
              // label: "Begin",
              color: "#8AE5C8",
              position: "bottom",
            },
          ],
        }),
      ],
    });

    // load music
    this.waveSurfer.load(store.getState().load.music);

    // get ready
    this.waveSurfer.on("ready", () => {
      this.ready = true;
      const region = JSON.parse(getItem("region") || "");
      region.map((r: LocalRegion) => this.addRegion(r.Start, r.End));
    });

    // Listener for seek event
    // waveSurfer.on("seek") will conflict
    this.addClickEvent();

    // This function is disabled considering performance issues
    // Listener when playing, which will update time
    // this.waveSurfer.on("audioprocess", () => {
    //   console.log("Update current time");
    //   store.dispatch(
    //     setTime({
    //       from: this.from,
    //       time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
    //     })
    //   );
    // });
  }

  /**
   * Play or Pause the music
   * @function
   */
  playPause() {
    this.waveSurfer.playPause();
    store.dispatch(playPause(this.waveSurfer.isPlaying()));

    // Update waveSurfer time to global state
    store.dispatch(
      setTime({
        from: this.from,
        time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
      })
    );
  }

  /**
   * Play the music
   * @function
   */
  play() {
    this.waveSurfer.play();
    store.dispatch(playPause(this.waveSurfer.isPlaying()));
  }

  /**
   * Pause the music
   * @function
   */
  pause() {
    this.waveSurfer.pause();
    store.dispatch(playPause(this.waveSurfer.isPlaying()));
  }

  /**
   * Play the region repeatly
   * @function
   */
  playLoop() {
    const Regions = Object.values(this.waveSurfer.regions.list);
    let Region = null;
    const setRegion = (r: Region) => {
      if (
        this.waveSurfer.getCurrentTime() <= (r.end || 0) &&
        this.waveSurfer.getCurrentTime() >= (r.start || 0)
      )
        Region = r;
    };
    (Regions as Array<Region>).map((r) => setRegion(r));

    if (Region) (Region as any).playLoop();
  }

  /**
   * Stop the music
   * @function
   */
  stop() {
    this.waveSurfer.stop();
    store.dispatch(playPause(this.waveSurfer.isPlaying()));
    store.dispatch(
      setTime({
        from: this.from,
        time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
      })
    );
  }

  /**
   * Seek to time
   * @param {number} time
   */
  seekTo(time: number) {
    if (!this.ready) return;
    const duration = this.waveSurfer.getDuration();
    this.waveSurfer.seekTo(time / 1000 / duration);
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
        store.dispatch(
          setTime({
            from: this.from,
            time: Math.round(timeValue * 1000),
          })
        );
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
  addMarkers(start: number, index: number) {
    this.waveSurfer.addMarker({
      time: start,
      color: "#8AE5C8",
      // label: index ? index : "Begin",
      position: "top",
    });
  }

  /**
   * create markers according to all dancer's status
   * @param { Object<{}> } controlMap - object of all dancer's status
   */
  updateMarkers(controlMap: ControlMapElement) {
    this.waveSurfer.clearMarkers();
    Object.values(controlMap).map((e, index) => {
      this.addMarkers(e.start / 1000, index);
    });
  }

  /**
   * clear all markers
   * @function
   */
  clearMarker() {
    this.waveSurfer.clearMarkers();
  }

  zoom(newValue: number) {
    this.waveSurfer.zoom(
      (newValue *
        (window.screen.availWidth - this.waveSurfer.params.minPxPerSec)) /
        50
    );
  }

  clickLast(last: number) {
    this.waveSurfer.setCurrentTime(last);
    store.dispatch(playPause(this.waveSurfer.isPlaying()));
    store.dispatch(
      setTime({
        from: this.from,
        time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
      })
    );
  }

  clickNext(next: number) {
    this.waveSurfer.setCurrentTime(next);
    store.dispatch(playPause(this.waveSurfer.isPlaying()));
    store.dispatch(
      setTime({
        from: this.from,
        time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
      })
    );
  }
}

export default WaveSurferApp;
