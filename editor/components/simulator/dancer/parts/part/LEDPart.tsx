import * as PIXI from "pixi.js";
import Part from "./Part";

class LEDPart extends Part {
  constructor(dancer, name, settings, textures) {
    super(dancer, name, settings);
    // textures.name: array of strings
    try {
      textures.name.forEach((path) => {
        this.textures[path] = PIXI.Texture.from(
          `${textures.prefix}${path}${textures.postfix}`
        );
      });
      if (textures.name.length)
        this.sprite.texture = this.textures[textures.name[0]];
    } catch (err) {
      console.error(err);
    }
  }

  updateTexture({ src, alpha }) {
    // console.log("Updating LEDPart", name, alpha)
    this.sprite.texture = this.textures[src];
    this.sprite.alpha = alpha;
  }
}

export default LEDPart;
