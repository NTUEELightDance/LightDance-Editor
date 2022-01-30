import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class Controls {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.domElement = renderer.domElement;
    this.initOrbitControls();
  }

  initOrbitControls() {
    const orbitControls = new OrbitControls(this.camera, this.domElement);
    orbitControls.enablePan = true;
    orbitControls.enableZoom = true;
    // controls.screenSpacePanning = true;
    orbitControls.target.set(
      -0.7125719340319995,
      2.533987823530335,
      -0.07978443261089622
    );
    orbitControls.update();

    this.orbitControls = orbitControls;
  }

  enableOrbitControls() {
    this.orbitControls.enabled = true;
  }
  disableOrbitControls() {
    this.orbitControls.enabled = false;
  }
}

export default Controls;
