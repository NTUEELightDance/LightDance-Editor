import WaveSurfer from "wavesurfer.js";

export default class WaveSurferApp {
  constructor() {
    this.waveserver = null;
    this.musicUrl = null;
    this.initailize();
  }

  initailize() {
    this.waveserver = WaveSurfer.create({
      container: "#waveform",
      waveColor: "tomato",
      progressColor: "purple",
    });
    this.waveserver.load("./asset/music.flac");
  }

  playPause() {
    this.waveserver.playPause();
  }
}
