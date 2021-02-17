import * as PIXI from "pixi.js";
// constants
import { DANCER_NUM } from "../../constants";
// load
import load from "../../../../data/load.json";
// utils
import updateFrameByTime from "../../slices/utils";
import { setItem, getItem } from "../../utils/localStorage";
// redux
import {
  setCurrentStatus,
  setControlFrame,
  setPosFrame,
  setNewPosRecord,
  posInit,
  controlInit,
  updateTimeData,
} from "../../slices/globalSlice";
import store from "../../store";
// components
import Dancer from "./dancer";
// TODEL
import loadedPosition from "../../../../data/position.json";
import loadedControl from "../../../../data/control_transform.json";

/**
 * Control the dancers (or other light objects) on display
 * @constructor
 */
class Controller {
  constructor() {
    this.dancers = null; // include items
    this.pixiApp = null;
    this.mainContainer = null;
  }

  /**
   * Initiate localStorage, waveSurferApp, PixiApp, dancers
   */
  init() {
    // initialization by localStorage
    if (!getItem("control")) {
      setItem("control", JSON.stringify(loadedControl));
    }
    if (!getItem("position")) {
      setItem("position", JSON.stringify(loadedPosition));
    }
    store.dispatch(controlInit(JSON.parse(getItem("control"))));
    store.dispatch(posInit(JSON.parse(getItem("position"))));

    // initialization for PIXIApp
    this.pixiApp = new PIXI.Application({ width: 960, height: 720 });
    this.mainContainer = new PIXI.Container();
    this.mainContainer.sortableChildren = true;
    this.pixiApp.stage.addChild(this.mainContainer);
    document.getElementById("main_stage").appendChild(this.pixiApp.view);

    // initialization for dancers
    this.dancers = [];
    for (let i = 0; i < DANCER_NUM; i += 1) {
      this.dancers.push(
        new Dancer(i, this.pixiApp, load.Texture, this.mainContainer)
      );
    }
    this.updateDancersPos(JSON.parse(getItem("position")), 0, 0);

    store.dispatch(setNewPosRecord());
  }

  /**
   * Update Local Storage
   * @param {string} key
   * @param {*} newData
   */
  updateLocalStorage(key, newData) {
    setItem(key, JSON.stringify(newData));
  }

  /**
   * @param {*} control
   * @param {*} position
   * @param {*} newFrame
   * @param {*} type
   */
  updateTimeDataByFrame(control, position, newFrame, type) {
    const newTimeData = {};
    if (type === "control") {
      if (newFrame <= control["player0"].length - 1 && newFrame >= 0) {
        const newTime = control["player0"][newFrame].Start;
        newTimeData.time = newTime;
        newTimeData.controlFrame = newFrame;
        newTimeData.posFrame = updateFrameByTime(position, 0, newTime);
        // this.wavesurferApp.seekTo(
        //   newTime / this.wavesurferApp.getDuration() / 1000
        // );
      }
    } else if (type === "position") {
      if (newFrame <= position["player0"].length - 1 && newFrame >= 0) {
        const newTime = position["player0"][newFrame].Start;
        newTimeData.time = newTime;
        newTimeData.controlFrame = updateFrameByTime(control, 0, newTime);
        newTimeData.posFrame = newFrame;
        // this.wavesurferApp.seekTo(
        //   newTime / this.wavesurferApp.getDuration() / 1000
        // );
      }
    }
    return newTimeData;
  }

  updateDancersControl(control, controlFrame) {
    this.dancers.forEach((dancer) => {
      dancer.updateControl(control[dancer.name][controlFrame].Status);
    });
    // console.log(store.getState().global.currentStatus);
  }

  updateDancersPos(position, time, posFrame) {
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
