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
import store from "../../store";
import { setSeletected } from "./pixiSlice";

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
    this.setPos();
    app.stage.addChild(this.container);

    // Dragging
    this.container.interactive = true;
    this.container.buttonMode = true;
    this.container
      .on("pointerdown", this.onDragStart)
      .on("pointerup", this.onDragEnd)
      .on("pointerupoutside", this.onDragEnd)
      .on("pointermove", this.onDragMove)
      .on("click", () => {
        store.dispatch(setSeletected([this.id]));
      });

    console.log("Dancer Constructed", this);
  }

  onDragStart(event) {
    console.log(event, this);
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
  }

  onDragEnd() {
    this.alpha = 1;
    this.dragging = false;
    // set the interaction data to null
    this.data = null;
  }

  onDragMove() {
    if (this.dragging) {
      const newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x - this.width / 2;
      this.y = newPosition.y - this.height / 2;
    }
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
