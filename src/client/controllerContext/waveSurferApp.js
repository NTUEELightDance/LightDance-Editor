import WaveSurfer from "wavesurfer.js";
import store from "../store";
import {
  updateTime,
  findCurrentControlFrame,
  findCurrentPosFrame,
} from "../features/globalSlice";
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
      console.log("seeking");
      store.dispatch(
        updateTime(Math.round(this.waveSurferApp.getCurrentTime() * 1000))
      );
    });
    this.waveSurferApp.on("audioprocess", () => {
      store.dispatch(
        updateTime(Math.round(this.waveSurferApp.getCurrentTime() * 1000))
      );
    });
  }

  playPause() {
    this.waveSurferApp.playPause();
  }
}

export default WaveSurferApp;
