import * as PIXI from "pixi.js";

class Part {
  constructor(dancer, name, settings) {
    this.dancer = dancer;
    this.dancerID = dancer.id;
    this.name = name;
    this.textures = {};
    this.sprite = new PIXI.Sprite();

    this.sprite.width = settings.width;
    this.sprite.height = settings.height;
    this.sprite.position.set(settings.x, settings.y);
    this.sprite.zIndex = settings.zIndex;
  }
}

export default Part;
