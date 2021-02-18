import * as PIXI from "pixi.js";
// constants
import { DANCER_NUM } from "../../constants";
// load
import load from "../../../../data/load.json";
// utils
import { setItem, getItem } from "../../utils/localStorage";
// redux actions and store
import {
  setNewPosRecord,
  posInit,
  controlInit,
} from "../../slices/globalSlice";
import store from "../../store";
// components
import Dancer from "./dancer";
// TODEL, need to be load including to load.json
import loadedPosition from "../../../../data/position.json";
import loadedControl from "../../../../data/control_transform.json";

/**
 * Control the dancers (or other light objects)'s status and pos
 * @constructor
 */
class Controller {
  constructor() {
    this.dancers = null;
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
    this.dancers = {};
    for (let i = 0; i < DANCER_NUM; i += 1) {
      const name = `dancer${i}`;
      this.dancers[name] = new Dancer(
        i,
        name,
        this.pixiApp,
        load.Texture,
        this.mainContainer
      );
    }

    // ????
    this.updateDancersPos(JSON.parse(getItem("position")), 0, 0);

    store.dispatch(setNewPosRecord());
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
      this.dancers[key].updateStatus(value);
    });
  }

  updateDancersPos(position, time, posFrame) {
    // if (position["player0"][posFrame + 1]) {
    //   this.dancers.forEach((dancer) => {
    //     const preFrame = position[dancer.name][posFrame];
    //     const nextFrame = position[dancer.name][posFrame + 1];
    //     dancer.updatePos(time, preFrame, nextFrame);
    //   });
    // } else {
    //   this.dancers.forEach((dancer) => {
    //     const preFrame = position[dancer.name][posFrame];
    //     dancer.updatePos(time, preFrame, preFrame);
    //   });
    // }
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
