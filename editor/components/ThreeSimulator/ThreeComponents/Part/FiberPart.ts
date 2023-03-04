import { FiberData } from "@/core/models";
import Part from "./Part";
import { state } from "core/state";

interface MeshType extends THREE.Mesh {
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

    const { colorCode, color, alpha } = status;
    if (this.mesh !== undefined) {
      this.mesh.material.emissiveIntensity = alpha / 15;

      // if colorCode exist use colorCode instead
      if (colorCode) {
        this.mesh.material.emissive.copy(colorCode);
        return;
      }

      if (state.colorMap[color]) {
        this.mesh.material.emissive.setHex(
          parseInt(state.colorMap[color].replace(/^#/, ""), 16)
        );
      } else {
        throw new Error(`color ${color} not found`);
      }
    }
  }
}
