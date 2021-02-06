import * as PIXI from "pixi.js";
import WaveSurferApp from "./waveSurferApp";
import Dancer from "./dancer";
import { DANCER_NUM } from "../constants";
import load from "../../../data/load.json";
import position from "../../../data/position.json";
import control from "../../../data/control.json";
import updateFrameByTime from "../features/utils";
import {
  setControlFrame,
  setPosFrame,
  setNewPosRecord,
  updateTimeData,
} from "../features/globalSlice";
import store from "../store";

class Controller {
  constructor() {
    this.wavesurferApp = null;
    this.dancers = null;
    this.pixiApp = null;
    this.mainContainer = null;
    this.localStorage = null;
  }

  init() {
    this.localStorage = window.localStorage;

    // initialization for wavesurferApp
    this.wavesurferApp = new WaveSurferApp();
    this.wavesurferApp.init();
    this.wavesurferApp = this.wavesurferApp.waveSurferApp;

    // initialization for PIXIApp
    this.pixiApp = new PIXI.Application({ width: 960, height: 720 });
    this.mainContainer = new PIXI.Container();
    this.mainContainer.sortableChildren = true;
    this.pixiApp.stage.addChild(this.mainContainer);
    document.getElementById("main_stage").appendChild(this.pixiApp.view);

    // initialization for dancers
    this.dancers = [];
    for (let i = 0; i < DANCER_NUM; ++i) {
      this.dancers.push(
        new Dancer(i, this.pixiApp, load.Texture, this.mainContainer)
      );
    }
    store.dispatch(setNewPosRecord());
  }

  updateTimeDataByFrame(newControlFrame) {
    const newTimeData = {};
    if (
      newControlFrame <= control["player0"].length - 1 &&
      newControlFrame >= 0
    ) {
      const newTime = control["player0"][newControlFrame].Start;
      newTimeData.time = newTime;
      newTimeData.controlFrame = newControlFrame;
      newTimeData.posFrame = updateFrameByTime(position, 0, newTime);
      this.wavesurferApp.seekTo(
        newTime / this.wavesurferApp.getDuration() / 1000
      );
    }
    return newTimeData;
  }

  // eslint-disable-next-line class-methods-use-this
  updateFrameWhilePlaying(time, controlFrame, posFrame) {
    // update for control
    if (time >= control["player0"][controlFrame + 1].Start) {
      store.dispatch(setControlFrame(controlFrame + 1));
    }
    // update for position
    if (!position["player0"][posFrame + 1]) return;
    if (time >= position["player0"][posFrame + 1].Start) {
      store.dispatch(setPosFrame(posFrame + 1));
    }
  }

  updateDancersControl(controlFrame) {
    this.dancers.forEach((dancer) => {
      dancer.updateControl(control[dancer.name][controlFrame].Status);
    });
  }

  updateDancersPos(time, posFrame) {
    if (position["player0"][posFrame + 1]) {
      this.dancers.forEach((dancer) => {
        const preFrame = position[dancer.name][posFrame];
        const nextFrame = position[dancer.name][posFrame + 1];
        dancer.updatePos(time, preFrame, nextFrame);
      });
    } else {
      this.dancers.forEach((dancer) => {
        const preFrame = position[dancer.name][posFrame];
        dancer.updatePos(time, preFrame, preFrame);
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  downloadJson(exportObj, exportName) {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportObj)
    )}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${exportName}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}

export default Controller;
