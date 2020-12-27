import * as PIXI from "pixi.js";
import { BlackPart, LightPart, LEDPart } from "./pixiClasses";
import {
  BLPARTS,
  LIGHTPARTS,
  LEDPARTS,
  DANCERPOS,
  DISPLAY_HEIGHT,
  DISPLAY_WIDTH,
  DANCER_NUM,
} from "../../constants";

class Dancer {
  constructor(id, app, loadTexture) {
    this.app = app;
    this.id = id; // dancer id
    this.status = {}; // dancer current status
    this.parts = {}; // dancer body part

    // BlackPart
    BLPARTS.forEach((blpart) => {
      this.parts[blpart] = new BlackPart(this, blpart);
    });
    // LightPart
    LIGHTPARTS.forEach((lipart) => {
      this.parts[lipart] = new LightPart(this, lipart);
    });
    // LEDPART
    LEDPARTS.forEach((ledpart) => {
      this.parts[ledpart] = new LEDPart(this, ledpart, loadTexture);
    });
    // this.parts["LEDH"] = new LEDPart(this, this.app, loadTexture["LEDH"]);    // LED Head

    // PIXI Rendering
    this.container = new PIXI.Container();
    this.container.sortableChildren = true;
    Object.keys(this.parts).forEach((key) => {
      this.container.addChild(this.parts[key].sprite);
    });
    // Calculate position and scale
    this.setPos();
    app.stage.addChild(this.container);

    console.log("Dancer Constructed", this);
  }

  setPos(num = DANCER_NUM, height = DISPLAY_HEIGHT, width = DISPLAY_WIDTH) {
    const ratio = this.container.width / this.container.height;
    this.container.height = height * 0.95;
    if (num > 1) this.container.height = this.container.height / 2;
    this.container.width = this.container.height * ratio;

    const half = num > 1 ? num / 2 : num;
    const wOffset = (width - half * this.container.width) / (half + 1);
    const y = this.id >= half ? height / 2 : 0;
    let _id = this.id % half;
    const x = (_id + 1) * wOffset + _id * this.container.width;
    this.container.position.set(x, y);
  }

  setStat(status) {
    // console.log("Dancer setStat", status);
    this.status = Object.assign({}, status);
  }

  updateTexture() {
    // console.log("Update Texture");
    Object.keys(this.parts).map((key) => {
      this.parts[key].updateTexture(this.status[key]);
    });
  }

  update(status) {
    this.setStat(status);
    this.updateTexture();
  }
}

export default Dancer;
