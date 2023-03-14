import { FiberData } from "@/core/models";
import Part from "./Part";
import { state } from "core/state";

export interface MeshType extends THREE.Mesh {
  material: THREE.MeshStandardMaterial;
}
export default class FIBERPart extends Part {
  mesh: MeshType;
  constructor(name: string, model: THREE.Object3D) {
    super(name, model);
    this.mesh = model.getObjectByName(name) as MeshType;
    if (this.mesh !== undefined) {
      this.mesh.material = this.mesh.material.clone();
      this.mesh.material.color.setHex(0);
      this.mesh.material.emissiveIntensity = 0;
    }
  }

  setVisibility(visible: boolean) {
    if (this.mesh !== undefined) {
      this.visible = visible;
      this.mesh.visible = visible;
    }
  }

  setStatus(status: FiberData) {
    if (!this.visible) return;
    if (this.mesh === undefined) return;

    const { rgb, colorID, alpha } = status;

    this.mesh.material.emissiveIntensity = alpha / 15;

    // console.log("colorID", colorID);

    // if colorCode exist use colorCode instead
    if (rgb) {
      this.mesh.material.emissive.setRGB(
        rgb[0] / 255,
        rgb[1] / 255,
        rgb[2] / 255
      );
      return;
    }

    if (state.colorMap[colorID]) {
      const colorRGB = state.colorMap[colorID].rgb;
      this.mesh.material.emissive.setRGB(
        colorRGB[0] / 255,
        colorRGB[1] / 255,
        colorRGB[2] / 255
      );
    } else {
      throw new Error(`colorID ${colorID} not found`);
    }
  }
}
