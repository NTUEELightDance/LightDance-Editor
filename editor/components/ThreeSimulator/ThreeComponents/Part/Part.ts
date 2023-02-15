import THREE from "three";
import { FiberData, LEDPartData } from "core/models";

// this is a base class for dancer parts
export default class Part {
  name: string;
  model: THREE.Object3D;
  visible: boolean;
  selected: boolean;
  constructor(name: string, model: THREE.Object3D) {
    this.name = name;
    this.model = model;
    this.visible = true;
    this.selected = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setVisibility(visible: boolean) {
    // set visibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setStatus(status: FiberData | LEDPartData) {
    // set status
  }
}
