import * as PIXI from "pixi.js";
import { BlackPart, ELPart, LEDPart } from "./parts";
// constants
import { IDLE, DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../../../constants";
// actions
import { toggleSelected, setCurrentPos } from "../../../slices/globalSlice";
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
        loadTexture[blpart]
      );
    });
    // ELPart
    Object.entries(ELPARTS).forEach(([elpart, settings]) => {
      this.parts[elpart] = new ELPart(
        this,
        elpart,
        settings,
        loadTexture[elpart]
      );
    });
    // LEDPART
    Object.entries(LEDPARTS).forEach(([ledpart, settings]) => {
      this.parts[ledpart] = new LEDPart(
        this,
        ledpart,
        settings,
        loadTexture[ledpart]
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
    const text = new PIXI.Text(this.id, {
      fontFamily: "Arial",
      fontSize: 44,
      fill: 0xff1010,
      align: "center",
    });
    this.container.addChild(text);

    // Calculate position and scale
    this.initScale(store.getState().load.dancerNames.length);
    this.mainContainer.addChild(this.container);

    // Dragging
    this.container.id = this.id;
    this.container.name = this.name;
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
   * Initiate Dancers' container scale to fit in the screen
   */
  initScale(num, height = DISPLAY_HEIGHT, width = DISPLAY_WIDTH) {
    const ratio = this.container.width / this.container.height;
    this.container.height = height * 0.95;
    if (num > 1) this.container.height /= 2;
    this.container.width = this.container.height * ratio;
  }

  /**
   * Set Dancer's position
   * @param {*} position
   */
  setPos(position) {
    const { x, y, z } = position;
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
      setCurrentPos({
        name: this.name,
        x: this.x,
        y: this.y,
        z: this.zIndex,
        save: true,
      })
    );
    // TODO: save
  }
}

export default Dancer;
