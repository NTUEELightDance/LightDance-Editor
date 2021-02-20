import * as PIXI from "pixi.js";
// utils
import { setItem, getItem } from "../../utils/localStorage";
// redux actions and store
import { posInit, controlInit } from "../../slices/globalSlice";
import store from "../../store";
// components
import Dancer from "./dancer";

/**
 * Control the dancers (or other light objects)'s status and pos
 * @constructor
 */
class Controller {
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
    if (!getItem("position")) {
      setItem("position", JSON.stringify(store.getState().load.position));
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
    const { dancerNames } = store.getState().load;
    dancerNames.forEach((name, idx) => {
      this.dancers[name] = new Dancer(
        idx,
        name,
        this.pixiApp,
        store.getState().load.texture,
        this.mainContainer
      );
    });
    console.log(this.dancers);
  }

  /**
   * update DancersStatus
   * @param {object} currentStatus - all dancers' status
   * ex. { dancer0: { HAT1: 0, ... }}
   */
  updateDancersStatus(currentStatus) {
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
  updateDancersPos(currentPos) {
    if (Object.entries(currentPos).length === 0)
      throw new Error(
        `[Error] updateDancersPos, invalid parameter(currentPos)`
      );
    Object.entries(currentPos).forEach(([key, value]) => {
      this.dancers[key].setPos(value);
    });
  }

  // TODEL: make this a util
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
