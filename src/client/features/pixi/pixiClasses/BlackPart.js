import toLoad from "./toLoad.json";
import Part from "./Part";
import * as PIXI from "pixi.js";

class BlackPart extends Part {
  constructor(dancer, name) {
    super(dancer, name, [name]);
    this.textures[this.paths[0]] = PIXI.Texture.from(
      `./asset/BlackPart/${this.paths[0]}.svg`
    );
    this.sprite.texture = this.textures[this.paths[0]];
  }

  updateTexture(args) {
    // console.log("Error: Black Part shouldn't be updateTexture!!!", args);
  }
}

export default BlackPart;
