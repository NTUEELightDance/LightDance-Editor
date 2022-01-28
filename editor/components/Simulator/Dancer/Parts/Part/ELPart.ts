import * as PIXI from "pixi.js";
import Part from "./Part";

class ELPart extends Part {
  constructor(dancer, name, settings, textures) {
    super(dancer, name, settings);
    // only one texture.name, and it's a string
    this.textures[textures.name] = PIXI.Texture.from(
      `${textures.prefix}${textures.name}${textures.postfix}`
    );
    this.sprite.texture = this.textures[textures.name];
  }

  updateTexture(alpha) {
    // console.log("Updating bright", alpha);
    this.sprite.alpha = alpha;
  }
}

export default ELPart;
