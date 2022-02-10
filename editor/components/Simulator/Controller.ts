import * as PIXI from "pixi.js";
// redux actions and store
import store from "../../store";
// components
import Dancer from "./Dancer";
// math
import { ControlMapStatus, DancerCoordinates } from "../../types/globalSlice";
// states
import { state } from "core/state";

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

  /**
   * animate function
   */
  animate = () => {
    this.updateDancersPos(state.currentPos);
    this.updateDancersStatus(state.currentStatus);
  };

  /**
   * start playing the animation
   */
  play() {
    this.pixiApp?.ticker.add(this.animate);
  }

  /**
   * stop playing the animation
   */
  stop() {
    this.pixiApp?.ticker.remove(this.animate);
  }
}

const controller = new Controller();

export default controller;
