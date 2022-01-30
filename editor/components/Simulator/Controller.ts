import * as PIXI from "pixi.js";
// utils
import { setItem, getItem } from "../../utils/localStorage";
// redux actions and store
import { posInit, controlInit } from "../../slices/globalSlice";
import store from "../../store";
// components
import Dancer from "./Dancer";
// math
import {
  updateFrameByTimeMap,
  updateFrameByTime,
  interpolationPos,
  fadeStatus,
} from "../../utils/math";
import { ControlMapStatus, DancerCoordinates } from "../../types/globalSlice";

/**
 * Control the dancers (or other light objects)'s status and pos
 * @constructor
 */
class Controller {
  dancers: { [name: string]: Dancer };
  pixiApp: PIXI.Application | null;
  mainContainer: PIXI.Container | null;
  constructor() {
    this.dancers = {};
    this.pixiApp = null;
    this.mainContainer = null;
  }

  /**
   * Initiate localStorage, waveSurferApp, PixiApp, dancers
   */
  init() {
    // initialization by localStorage
    if (!getItem("control")) {
      setItem("control", JSON.stringify(store.getState().load.control));
    }
    if (!getItem("controlMap")) {
      setItem("controlMap", JSON.stringify(store.getState().load.controlMap));
    }
    if (!getItem("posRecord")) {
      setItem("posRecord", JSON.stringify(store.getState().load.position));
    }
    if (!getItem("posMap")) {
      setItem("posMap", JSON.stringify(store.getState().load.posMap));
    }
    store.dispatch(
      controlInit({
        controlRecord: JSON.parse(getItem("control")!),
        controlMap: JSON.parse(getItem("controlMap")!),
      })
    );
    store.dispatch(
      posInit({
        posRecord: JSON.parse(getItem("posRecord")!),
        posMap: JSON.parse(getItem("posMap")!),
      })
    );

    // initialization for PIXIApp
    this.pixiApp = new PIXI.Application({
      resizeTo: document.getElementById("pixi")!,
      backgroundColor: 0x000000,
    });
    this.mainContainer = new PIXI.Container();
    this.mainContainer.sortableChildren = true;
    this.pixiApp.stage.addChild(this.mainContainer);
    document.getElementById("main_stage")!.appendChild(this.pixiApp.view);

    // initialization for dancers
    const { dancerNames } = store.getState().load;
    dancerNames.forEach((name: string, idx: number) => {
      this.dancers[name] = new Dancer(
        idx,
        name,
        this.pixiApp,
        store.getState().load.texture,
        this.mainContainer
      );
    });
  }

  /**
   * update DancersStatus
   * @param {object} currentStatus - all dancers' status
   * ex. { dancer0: { HAT1: 0, ... }}
   */
  updateDancersStatus(currentStatus: ControlMapStatus) {
    if (Object.entries(currentStatus).length === 0)
      throw new Error(
        `[Error] updateDancersStatus, invalid parameter(currentStatus)`
      );
    Object.entries(currentStatus).forEach(([key, value]) => {
      this.dancers[key].setStatus(value);
    });
  }

  /**
   * updateDancersPos
   * @param {*} currentPos
   * ex. { dancer0: { "x": 49.232, "y": 0, "z": 0 }}
   */
  updateDancersPos(currentPos: DancerCoordinates) {
    if (Object.entries(currentPos).length === 0)
      throw new Error(
        `[Error] updateDancersPos, invalid parameter(currentPos)`
      );
    Object.entries(currentPos).forEach(([key, value]) => {
      this.dancers[key].setPos(value);
    });
  }

  // update each frame according to the current time
  animate() {
    // calculate simluation time + waveSurferTime to find the latset frame
    const time =
      this.pixiApp.waveSurferTime + performance.now() - this.pixiApp.startTime;
    const { state } = this.pixiApp;

    // set timeData.controlFrame and currentStatus
    const newControlFrame = updateFrameByTimeMap(
      state.controlRecord,
      state.controlMap,
      state.timeData.controlFrame,
      time
    );

    state.timeData.controlFrame = newControlFrame;

    // status fade
    if (newControlFrame === state.controlRecord.length - 1) {
      // Can't fade
      state.currentStatus =
        state.controlMap[state.controlRecord[newControlFrame]].status;
    } else {
      // do fade
      state.currentStatus = fadeStatus(
        time,
        state.controlMap[state.controlRecord[newControlFrame]],
        state.controlMap[state.controlRecord[newControlFrame + 1]]
      );
    }

    // set timeData.posFrame and currentPos
    const newPosFrame = updateFrameByTime(
      state.posRecord,
      state.timeData.posFrame,
      time
    );
    state.timeData.posFrame = newPosFrame;
    // position interpolation
    if (newPosFrame === state.posRecord.length - 1) {
      // can't interpolation
      state.currentPos = state.posRecord[newPosFrame].pos;
    } else {
      // do interpolation
      state.currentPos = interpolationPos(
        time,
        state.posRecord[newPosFrame],
        state.posRecord[newPosFrame + 1]
      );
    }

    // set currentFade
    state.currentFade =
      state.controlMap[state.controlRecord[newControlFrame]].fade;

    this.updateDancersStatus(state.currentStatus);
    this.updateDancersPos(state.currentPos);
  }

  // fetch controlRecord, posRecord and timeData and update ticker function
  fetch() {
    const { timeData, controlRecord, controlMap, posRecord } =
      store.getState().global;
    this.pixiApp.startTime = performance.now();
    this.pixiApp.waveSurferTime = timeData.time;
    this.pixiApp.state = { controlRecord, controlMap, posRecord };
    this.pixiApp.state.timeData = { ...timeData };
    this.tickerF = this.animate.bind(this);
  }

  // add ticker funciton to ticker and start playing
  play() {
    this.pixiApp.ticker.add(this.tickerF);
  }

  // remove ticker function from ticker
  stop() {
    this.pixiApp.ticker.remove(this.tickerF);
  }
}

export default Controller;
