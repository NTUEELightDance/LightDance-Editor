import WaveSurfer from "wavesurfer.js";
import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
// redux
import store from "../../store";
import { playPause, updateTimeData, setTime } from "../../slices/globalSlice";

// constant
import load from "../../../../data/load.json";
import { WAVESURFERAPP } from "../../constants";

/**
 * control 3rd party package, WaveSurfer
 */
class WaveSurferApp {
  constructor() {
    this.waveSurfer = null;
    this.from = WAVESURFERAPP;
    // this.addClickEvent();
  }

  init() {
    this.waveSurfer = WaveSurfer.create({
      container: "#waveform",
      waveColor: "#5bc1f0",
      progressColor: "#1883b5",
      cursorColor: "#edf0f1",
      // height: screen.height * 0.08,
      plugins: [
        CursorPlugin.create({
          showTime: true,
          opacity: 1,
          color: "#edf0f1",
          customShowTimeStyle: {
            "background-color": "#000",
            color: "#fff",
            padding: "2px",
            "font-size": "10px",
          },
        }),
        TimelinePlugin.create({
          container: "#wave-timeline",
          unlabeledNotchColor: "white",
          primaryColor: "white",
          secondaryColor: "white",
          primaryFontColor: "white",
          secondaryFontColor: "white",
        }),
      ],
    });
    this.waveSurfer.load(load.Music);
    // Listener for seek event
    this.waveSurfer.on("seek", () => {
      // Q: Not really the same as addClickEvent's calculate
      console.log(`seek to ${this.waveSurfer.getCurrentTime() * 1000}`);
      // store.dispatch(
      //   updateTimeData({
      //     time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
      //   })
      // );
      // if (this.waveSurfer.isPlaying()) {
      //   this.waveSurfer.play();
      // } else {
      //   this.waveSurfer.pause();
      // }
    });

    // Listener when playing, which will update time
    // this.waveSurfer.on("audioprocess", () => {
    // store.dispatch(
    //   updateTimeData({
    //     time: Math.round(this.waveSurfer.getCurrentTime() * 1000),
    //   })
    // );
    // });
  }

  // play or pause the music
  playPause() {
    this.waveSurfer.playPause();
    store.dispatch(playPause(this.waveSurfer.isPlaying()));
  }

  // stop the music
  stop() {
    this.waveSurfer.stop();
    // TODO: store dispatch time
    store.dispatch(playPause(this.waveSurfer.isPlaying()));
  }

  // add cursor click event, not the same as seek
  // addClickEvent() {
  //   document.getElementById("waveform").addEventListener("click", (e) => {
  //     // From CursorPlugin Source Code
  //     const bbox = this.waveSurfer.container.getBoundingClientRect();
  //     const xpos = e.clientX - bbox.left;
  //     const duration = this.waveSurfer.getDuration();
  //     const elementWidth =
  //       this.waveSurfer.drawer.width / this.waveSurfer.params.pixelRatio;
  //     const scrollWidth = this.waveSurfer.drawer.getScrollX();

  //     const scrollTime =
  //       (duration / this.waveSurfer.drawer.width) * scrollWidth;

  //     const timeValue =
  //       Math.max(0, (xpos / elementWidth) * duration) + scrollTime;
  //     console.log(timeValue);
  //     // this.mgr.changeTime(Math.round(timeValue * 1000));
  //   });
  // }
}

export default WaveSurferApp;
