import THREE from "three";
import { Color } from "three";

export type FiberStatus = {
  color: string;
  alpha: number;
  colorCode: Color;
};

export type LEDStatus = {
  recordIndex: number;
  effectIndex: number;
  effect: Array<{
    colorCode: string;
    alpha: number;
  }>;
};
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

  setStatus(status: FiberStatus | LEDStatus) {
    // set status
  }
}
