import THREE from "three";
import { Fiber, LedEffectFrame } from "core/models";

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

  setVisibility(visible: boolean) {
    // set visibility
  }

  setStatus(status: Fiber | LedEffectFrame) {
    // set status
  }
}
