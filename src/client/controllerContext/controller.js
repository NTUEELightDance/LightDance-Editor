import * as PIXI from "pixi.js";
import WaveSurferApp from "./waveSurferApp";
import Dancer from "./dancer";
import { DANCER_NUM } from "../constants";
import load from "../../../data/load.json";
import control from "../../../data/control.json";
import { setFrame } from "../features/globalSlice";
import store from "../store";

class Controller {
  constructor() {
    this.wavesurferApp = null;
    this.dancers = null;
    this.pixiApp = null;
  }

  init() {
    // initialization for wavesurferApp
    this.wavesurferApp = new WaveSurferApp();
    this.wavesurferApp.init();

    // initialization for PIXIApp
    this.pixiApp = new PIXI.Application({ width: 960, height: 720 });
    document.getElementById("main_stage").appendChild(this.pixiApp.view);

    // initialization for dancers
    this.dancers = [];
    for (let i = 0; i < DANCER_NUM; ++i) {
      this.dancers.push(new Dancer(i, this.pixiApp, load.Texture));
    }
  }

  updateWhilePlaying(time, frame) {
    if (time >= control["player0"][frame + 1].Start) {
      store.dispatch(setFrame(frame + 1));
      this.dancers.forEach((dancer, i) => {
        dancer.update(control[dancer.name][frame + 1].Status);
      });
    }
  }
}

export default Controller;
