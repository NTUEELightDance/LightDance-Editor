import * as THREE from "three";

import { OrbitControls } from "./OrbitControls";
import { DragControls } from "./DragControls";
import { SelectControls } from "./SelectControls";

import { setCurrentPos } from "core/actions/currentPos";

import { Dancer } from "../ThreeComponents";

import { DANCER, PART, POSITION } from "@/constants";

import { PosMapStatus, SelectionMode } from "@/core/models";

class Controls {
  renderer: THREE.Renderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  dancers: Record<string, Dancer>;
  objects: THREE.Object3D[];
  orbitControls: OrbitControls;
  dragControls: DragControls;
  selectControls: SelectControls;

  constructor(
    renderer: THREE.Renderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    dancers: Record<string, Dancer>
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.domElement = renderer.domElement;
    this.dancers = dancers;
    this.objects = Object.values(this.dancers).map((dancer) => dancer.model);

    this.orbitControls = this.initOrbitControls();
    this.dragControls = this.initDragControls();
    this.selectControls = this.initSelectControls(this.dragControls);
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
    orbitControls.position0.set(
      -0.27423481610277156,
      3.9713106563331033,
      17.22495526821853
    );
    orbitControls.zoomSpeed = 0.3;

    orbitControls.update();

    return orbitControls;
  }

  initDragControls() {
    const dragControls = new DragControls(
      [...this.objects],
      this.camera,
      this.renderer.domElement
    );
    dragControls.enabled = false;
    dragControls.addEventListener("dragend", this.dragEnd.bind(this));
    return dragControls;
  }

  initSelectControls(dragControls: DragControls) {
    const selectControls = new SelectControls(
      [...this.objects],
      this.camera,
      this.renderer.domElement,
      dragControls,
      this.dancers,
      this.scene,
      this.renderer
    );

    return selectControls;
  }

  activate(selectionMode: SelectionMode) {
    switch (selectionMode) {
      case DANCER:
        break;
      case PART:
        break;
      case POSITION:
        this.dragControls.enabled = true;
        this.dragControls.activate();
        break;
    }
  }

  deactivate() {
    this.dragControls.deactivate();
    this.dragControls.enabled = false;
  }

  dragEnd() {
    const selected: string[] = [];
    const _group = this.selectControls.getGroup();
    while (_group.children.length) {
      selected.push(_group.children[0].name);
      this.scene.attach(_group.children[0]);
    }
    _group.position.set(0, 0, 0);

    const currentPos: PosMapStatus = {};
    Object.entries(this.dancers).forEach(([name, dancer]) => {
      const position = dancer.model!.getWorldPosition(new THREE.Vector3());

      currentPos[name] = {
        x: position.x,
        y: Math.max(position.y, 0),
        z: position.z,
      };

      if (selected.includes(name)) {
        _group.attach(dancer.model);
      }
    });
    setCurrentPos({ payload: currentPos });
  }
}

export default Controls;
