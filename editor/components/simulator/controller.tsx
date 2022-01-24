import * as PIXI from "pixi.js";
// utils
import { setItem, getItem } from "../../utils/localStorage";
// redux actions and store
import { posInit, controlInit } from "../../slices/globalSlice";
import store from "../../store";
// components
import Dancer from "./dancer";
import dancer from "./dancer";

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
    if (!getItem("position")) {
      setItem("position", JSON.stringify(store.getState().load.position));
    }
    store.dispatch(
      controlInit({
        controlRecord: JSON.parse(getItem("control")!),
        controlMap: JSON.parse(getItem("controlMap")!),
      })
    );
    store.dispatch(posInit(JSON.parse(getItem("position")!)));

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
}

export default Controller;
