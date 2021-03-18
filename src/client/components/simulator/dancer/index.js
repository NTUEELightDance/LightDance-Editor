import * as PIXI from "pixi.js";
import { BlackPart, ELPart, LEDPart } from "./parts";
// constants
import { IDLE } from "../../../constants";
// actions
import {
  toggleSelected,
  setCurrentPosByName,
} from "../../../slices/globalSlice";
// store
import store from "../../../store";

/**
 * Dancer
 * @constructor
 * @param {number} id - The id of the dancer
 * @param {string} name - The name of the dancer
 * @param {object} app
 * @param {object} loadTexture - The loaded Textures
 * @param {object} mainContainer - The mai pixi container
 */
class Dancer {
  constructor(id, name, app, loadTexture, mainContainer) {
    this.app = app;
    this.mainContainer = mainContainer;
    this.id = id; // dancer id
    this.name = name;
    this.status = {}; // dancer current status
    this.parts = {}; // dancer body part

    // BlackPart
    const { BLPARTS, ELPARTS, LEDPARTS } = store.getState().load.dancers[name];
    Object.entries(BLPARTS).forEach(([blpart, settings]) => {
      this.parts[blpart] = new BlackPart(
        this,
        blpart,
        settings,
        loadTexture["BLPARTS"][blpart]
      );
    });
    // ELPart
    Object.entries(ELPARTS).forEach(([elpart, settings]) => {
      this.parts[elpart] = new ELPart(
        this,
        elpart,
        settings,
        loadTexture["ELPARTS"][elpart]
      );
    });
    // LEDPART
    Object.entries(LEDPARTS).forEach(([ledpart, settings]) => {
      this.parts[ledpart] = new LEDPart(
        this,
        ledpart,
        settings,
        loadTexture["LEDPARTS"][ledpart]
      );
    });

    // PIXI Rendering
    // render dancer
    this.container = new PIXI.Container();
    this.container.sortableChildren = true;

    Object.keys(this.parts).forEach((key) => {
      this.container.addChild(this.parts[key].sprite);
    });

    // render dancer Id
    const text = new PIXI.Text(this.name, {
      fontFamily: "Arial",
      fontSize: 25,
      fill: 0x9ca8bc,
      align: "center",
    });
    this.container.addChild(text);

    // Calculate position and scale
    this.initScale();
    this.mainContainer.addChild(this.container);

    // Dragging
    this.container.id = this.id;
    this.container.name = this.name;
    this.container.posMinusCenter = this.posMinusCenter.bind(this);
    this.container.interactive = true;
    this.container.buttonMode = true;
    this.container
      .on("pointerdown", this.onDragStart)
      .on("pointerup", this.onDragEnd)
      .on("pointerupoutside", this.onDragEnd)
      .on("pointermove", this.onDragMove)
      .on("click", () => {
        store.dispatch(toggleSelected(this.name));
      });
  }

  /**
   * update all the parts' texture by this.status
   */
  updateTexture() {
    Object.keys(this.parts).forEach((key) => {
      this.parts[key].updateTexture(this.status[key]);
    });
  }

  /**
   * set dancer's status, and call updateTexture
   * @param {object} status ex. { HAT: 0 ...}
   */
  setStatus(status) {
    this.status = status;
    this.updateTexture();
  }

  /**
   * Initiate Dancers' container scale to fit in the screen (screen height's 0.4)
   */
  initScale() {
    const ratio = this.container.width / this.container.height;
    this.container.height = this.app.renderer.height * 0.35;
    this.container.width = this.container.height * ratio;
  }

  /**
   * Set Dancer's position, relative to the center
   * @param {*} position
   */
  setPos(position) {
    const { x, y, z } = this.posAddCenter(position); // turn relative position to static position
    this.container.position.set(x, y);
    this.container.zIndex = z;
  }

  /**
   * Drag Start
   * @param {*} event
   */
  onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.alpha = 0.5;
    // can't drag when mode is IDLE
    this.dragging = store.getState().global.mode !== IDLE;
  }

  /**
   * Drag Moving
   */
  onDragMove() {
    if (this.dragging) {
      const newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x - this.width / 2;
      this.y = newPosition.y - this.height / 2;
    }
  }

  /**
   * Drag end
   */
  onDragEnd() {
    this.alpha = 1;
    this.dragging = false;
    // set the interaction data to null
    this.data = null;
    this.zIndex = this.position.y;
    store.dispatch(
      setCurrentPosByName({
        name: this.name,
        ...this.posMinusCenter({
          x: this.x,
          y: this.y,
          z: this.zIndex,
        }),
      })
    );
  }

  /**
   * Calculate real position according to the center
   */
  posAddCenter(position) {
    const centerX = this.app.renderer.width * 0.5;
    const centerY = this.app.renderer.height * 0.5;
    return {
      x: position.x + centerX,
      y: position.y + centerY,
      z: position.z + centerY,
    };
  }

  /**
   * Calculate related position according to the center
   * @param { { x, y, z }} position
   */
  posMinusCenter(position) {
    const centerX = this.app.renderer.width * 0.5;
    const centerY = this.app.renderer.height * 0.5;
    return {
      x: position.x - centerX,
      y: position.y - centerY,
      z: position.z - centerY,
    };
  }
}

export default Dancer;
