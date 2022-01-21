import * as PIXI from "pixi.js";
import Part from "./Part";

class BlackPart extends Part {
  constructor(dancer, name, settings, textures) {
    super(dancer, name, settings);
    // only one texture.name, and it's a string
    this.textures[textures.name] = PIXI.Texture.from(
      `${textures.prefix}${textures.name}${textures.postfix}`
    );
    this.sprite.texture = this.textures[textures.name];
  }

  updateTexture(args) {
    // console.log("Error: Black Part shouldn't be updateTexture!!!", args);
  }
}

export default BlackPart;
