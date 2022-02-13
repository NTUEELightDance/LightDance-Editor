import { OrbitControls } from "./OrbitControls";
import { DragControls } from "./DragControls";
import { SelectControls } from "./SelectControls";

import { setCurrentPos } from "../../../core/actions/currentPos";

class Controls {
  constructor(renderer, scene, camera, dancers) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.domElement = renderer.domElement;
    this.dancers = dancers;
    this.initOrbitControls();
  }

  initOrbitControls() {
    const orbitControls = new OrbitControls(this.camera, this.domElement);
    orbitControls.enablePan = true;
    orbitControls.enableZoom = true;
    // orbitControls.screenSpacePanning = true;
    orbitControls.target.set(
      -0.7125719340319995,
      2.533987823530335,
      -0.07978443261089622
    );

    orbitControls.update();

    this.orbitControls = orbitControls;
  }

  initDragControls() {
    this.objects = Object.values(this.dancers).map((dancer) => dancer.model);
    this.dragControls = new DragControls(
      [...this.objects],
      this.camera,
      this.renderer.domElement
    );
    this.dragControls.enabled = false;
    this.dragControls.addEventListener("dragend", this.dragEnd.bind(this));
  }

  initDanceSelector() {
    const selectControls = new SelectControls(
      [...this.objects],
      this.camera,
      this.renderer.domElement,
      this.dragControls,
      this.dancers,
      this.scene
    );
    this.selectControls = selectControls;
    this.activate();
  }

  activate() {
    addEventListener("keydown", this.onKeyDown.bind(this));
  }

  deactivate() {
    removeEventListener("keydown", this.onKeyDown.bind(this));
  }

  onKeyDown(event) {
    // press v to enable moving
    if (event.keyCode === 86) {
      // this.dragControls.enabled = true;
      this.dragControls.enabled = !this.dragControls.enabled;
      this.selectControls.enabled = !this.dragControls.enabled;
      console.log(this.dragControls.enabled);
    }
  }

  dragEnd() {
    const selected = [];
    const _group = this.selectControls.getGroup();
    while (_group.children.length) {
      selected.push(_group.children[0].name);
      this.scene.attach(_group.children[0]);
    }
    _group.position.set(0, 0, 0);

    const currentPos = {};
    Object.entries(this.dancers).forEach(([name, dancer], i) => {
      const { position } = dancer.model;

      currentPos[name] = {
        x: position.x * 30,
        y: position.z * 30,
        z: position.z * 30,
      };

      if (selected.includes(name)) {
        _group.attach(dancer.model);
      }
    });
    setCurrentPos({ payload: currentPos });
  }
}

export default Controls;
