import * as PIXI from "pixi.js";
import Part from "./Part";

class LightPart extends Part {
  constructor(dancer, name) {
    super(dancer, name, [name]);
    this.textures[this.paths[0]] = PIXI.Texture.from(
      `./asset/Part/${this.paths[0]}.svg`
    );
    this.sprite.interactive = true;
    this.sprite.buttonMode = true;
    /*
    this.sprite.on("click", () => {
      const checkBox = document.querySelector("#dancer-checkbox-list").children[
        dancer.id
      ].children[0];
      checkBox.onclick();
      checkBox.checked = true;
    });
    */
  }
  updateTexture(alpha) {
    // console.log("Updating bright", alpha);
    this.sprite.texture = this.textures[this.paths[0]];
    this.sprite.alpha = alpha;
  }
}

export default LightPart;
