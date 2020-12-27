import * as PIXI from "pixi.js";
import Part from "./Part";

class LEDPart extends Part {
  constructor(dancer, name, textures) {
    super(dancer, name, textures);
    this.paths[name].forEach((path) => {
      try {
        this.textures[path] = PIXI.Texture.from(
          `./asset/LED/${name}/${path}.png`
        );
      } catch (err) {
        console.error(err);
      }
    });

    /*
      const checkBox = document.querySelector("#dancer-checkbox-list").children[
        dancer.id
      ].children[0];
      checkBox.onclick();
      checkBox.checked = true;
      */
    // };
  }

  updateTexture({ name, alpha }) {
    // console.log("Updating LEDPart", name, alpha)
    this.sprite.texture = this.textures[name];
    this.sprite.alpha = alpha;
  }
}

export default LEDPart;
