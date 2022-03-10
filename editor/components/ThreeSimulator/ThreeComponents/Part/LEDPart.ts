import Part from "./Part";

const defaultDisplay = {
  colorCode: "#000000",
  alpha: 0,
};

export default class LEDPart extends Part {
  constructor(name, model) {
    super(name, model);
    this.meshes = [];
    this.getMeshes();
  }

  getMeshes() {
    if (this.name === "Visor_LED") {
      for (let i = 0; i < 36; i++) {
        const name = `${this.name}_${String(i).padStart(3, "0")}`;
        const mesh = this.model.getObjectByName(name);
        mesh.material = mesh.material.clone();
        mesh.material.color.setHex(0);
        mesh.material.emissiveIntensity = 0;
        this.meshes.push(mesh);
      }
    }
  }

  setStatus(status) {
    const { effect } = status;
    this.meshes.forEach((mesh, i) => {
      const display = effect[i] || defaultDisplay;
      const { colorCode, alpha } = display;

      this.meshes[i].material.emissive.setHex(
        parseInt(colorCode.replace(/^#/, ""), 16)
      );
      this.meshes[i].material.emissiveIntensity = alpha / 15;
    });
  }
}
