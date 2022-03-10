import Part from "./Part";
import { state } from "core/state";

export default class OFPart extends Part {
  constructor(name, model) {
    super(name, model);
    this.mesh = model.getObjectByName(name);
    this.mesh.material = this.mesh.material.clone();
    this.mesh.material.color.setHex(0);
    this.mesh.material.emissiveIntensity = 0;
  }

  setStatus(status) {
    const { colorCode, color, alpha } = status;

    this.mesh.material.emissiveIntensity = alpha / 15;

    // if colorCode exist use colorCode instead
    if (colorCode) {
      this.mesh.material.emissive.copy(colorCode);
    } else {
      this.mesh.material.emissive.setHex(
        parseInt(state.colorMap[color].replace(/^#/, ""), 16)
      );
    }
  }
}
