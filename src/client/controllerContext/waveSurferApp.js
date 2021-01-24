import WaveSurfer from "wavesurfer.js";
import store from "../store";
import { udpateTime, findCurrentFrame } from "../features/globalSlice";
import load from "../../../data/load.json";

class WaveSurferApp {
  constructor() {
    this.waveSurferApp = null;
  }

  init() {
    this.waveSurferApp = WaveSurfer.create({
      container: "#waveform",
      waveColor: "tomato",
      progressColor: "purple",
    });
    this.waveSurferApp.load(load.Music);
    this.waveSurferApp.on("seek", () => {
      store.dispatch(
        findCurrentFrame(Math.round(this.waveSurferApp.getCurrentTime() * 1000))
      );
    });
    this.waveSurferApp.on("audioprocess", () => {
      store.dispatch(
        udpateTime(Math.round(this.waveSurferApp.getCurrentTime() * 1000))
      );
    });
  }

  playPause() {
    this.waveSurferApp.playPause();
  }
}

export default WaveSurferApp;
