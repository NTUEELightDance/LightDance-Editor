import { LEDPartData } from "@/core/models";
import Part from "./Part";
const defaultDisplay = {
  colorCode: "#000000",
  alpha: 255,
};
interface MeshType extends THREE.Mesh {
  material: THREE.MeshStandardMaterial;
}

export default class LEDPart extends Part {
  meshes: MeshType[];
  constructor(name: string, model: THREE.Object3D) {
    super(name, model);
    this.meshes = [];
    this.getMeshes();
    // console.log("selected", this.selected);
  }

  getMeshes() {
    for (let i = 1; ; i++) {
      const name = `${this.name}${String(i).padStart(3, "0")}`;
      const mesh = this.model.getObjectByName(name) as MeshType;
      if (mesh == null) break;
      mesh.material = mesh.material.clone();
      mesh.visible = true;
      mesh.material.color.setHex(0);
      mesh.material.emissiveIntensity = 0;
      this.meshes.push(mesh);
    }
  }

  setVisibility(visible: boolean) {
    this.visible = visible;
    this.meshes.forEach((mesh: THREE.Mesh) => {
      mesh.visible = visible;
    });
  }

  setStatus(status: LEDPartData) {
    if (!this.visible) return;
    const { effect } = status;
    this.meshes.forEach((mesh: THREE.Mesh, i) => {
      const display = effect[i] || defaultDisplay;
      const { colorCode, alpha } = display;

      this.meshes[i].material.emissive.setHex(
        parseInt(colorCode.replace(/^#/, ""), 16)
      );
      this.meshes[i].material.emissiveIntensity = alpha / 15;
    });
  }
}
