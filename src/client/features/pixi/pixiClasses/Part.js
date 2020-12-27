import * as PIXI from "pixi.js";
import { PARTARGS } from "../../../constants";

class Part {
  constructor(dancer, name, textures) {
    this.dancer = dancer;
    this.dancerID = dancer.id;
    this.name = name;
    this.paths = textures;
    this.textures = {};
    this.sprite = new PIXI.Sprite();

    this.sprite.width = PARTARGS[name].width;
    this.sprite.height = PARTARGS[name].height;
    this.sprite.position.set(PARTARGS[name].x, PARTARGS[name].y);
    this.sprite.zIndex = PARTARGS[name].zIndex;

    // console.log(this);
  }
}

export default Part;
