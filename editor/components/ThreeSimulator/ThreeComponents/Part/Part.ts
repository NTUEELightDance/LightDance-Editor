import THREE from "three";
import { FiberData, ThreeSimulatorLEDPart } from "core/models";

// this is a base class for dancer parts
export default class Part {
  name: string;
  model: THREE.Object3D;
  visible: boolean;
  constructor(name: string, model: THREE.Object3D) {
    this.name = name;
    this.model = model;
    this.visible = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setVisibility(visible: boolean) {
    // set visibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setStatus(status: FiberData | ThreeSimulatorLEDPart) {
    // set status
  }
}
