import * as PIXI from "pixi.js";
import Part from "./Part";

class LightPart extends Part {
  constructor(dancer, name) {
    super(dancer, name, [name]);
    this.textures[this.paths[0]] = PIXI.Texture.from(
      `./asset/Part/${this.paths[0]}.svg`
    );
  }

  updateTexture(alpha) {
    // console.log("Updating bright", alpha);
    this.sprite.texture = this.textures[this.paths[0]];
    this.sprite.alpha = alpha;
  }
}

export default LightPart;
