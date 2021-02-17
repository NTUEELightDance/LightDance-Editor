import WaveSurfer from "wavesurfer.js";
import store from "../store";
import { updateTimeData } from "../slices/globalSlice";
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
        updateTimeData({
          time: Math.round(this.waveSurferApp.getCurrentTime() * 1000),
        })
      );

      if (this.waveSurferApp.isPlaying()) {
        this.waveSurferApp.play();
      } else {
        this.waveSurferApp.pause();
      }
    });
    this.waveSurferApp.on("audioprocess", () => {
      store.dispatch(
        updateTimeData({
          time: Math.round(this.waveSurferApp.getCurrentTime() * 1000),
        })
      );
    });
  }

  playPause() {
    this.waveSurferApp.playPause();
  }
}

export default WaveSurferApp;
