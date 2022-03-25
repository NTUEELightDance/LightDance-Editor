import Part from "./Part";
import { state } from "core/state";

export default class FIBERPart extends Part {
  mesh: THREE.Mesh;
  constructor(name: string, model: THREE.Object3D) {
    super(name, model);
    this.mesh = model.getObjectByName(name);
    this.mesh.material = this.mesh.material.clone();
    this.mesh.material.color.setHex(0);
    this.mesh.material.emissiveIntensity = 0;
  }

  setVisibility(visible: boolean) {
    this.visible = visible;
    this.mesh.visible = visible;
  }

  setStatus(status) {
    if (!this.visible) return;

    const { colorCode, color, alpha } = status;

    this.mesh.material.emissiveIntensity = alpha / 15;

    // if colorCode exist use colorCode instead

    if (colorCode) {
      this.mesh.material.emissive.copy(colorCode);
    } else {
      if (!state.colorMap[color]) {
        console.error(`Color Not Found: ${color}`);
        this.mesh.material.emissive.setHex(0x000000);
      } else
        this.mesh.material.emissive.setHex(
          parseInt(state.colorMap[color].replace(/^#/, ""), 16)
        );
    }
  }
}
