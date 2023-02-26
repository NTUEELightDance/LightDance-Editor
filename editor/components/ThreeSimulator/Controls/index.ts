import * as THREE from "three";

import { OrbitControls } from "./OrbitControls";
import { DragControls } from "./DragControls";
import { SelectControls } from "./SelectControls";

import { SelectionBox } from "./SelectionBox";
import { SelectionHelper } from "./SelectionHelper";

import { setCurrentPos } from "core/actions/currentPos";

import { Dancer } from "../ThreeComponents";

import "./controls.module.css";
import { DANCER, PART, POSITION } from "@/constants";

import { log } from "core/utils";
import { PosMapStatus } from "@/core/models";
import { reactiveState } from "@/core/state";

class Controls {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  dancers: Record<string, Dancer>;
  objects: object;
  orbitControls!: OrbitControls;
  dragControls!: DragControls;
  selectControls!: SelectControls;

  constructor(
    renderer: THREE.WebGLRenderer,
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

    this.initOrbitControls();
    this.initDragControls();
    this.initDanceSelector();
    // this.initBoxSelectControls();
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

    this.orbitControls = orbitControls;
  }

  initBoxSelectControls() {
    const selectionBox = new SelectionBox(this.camera, this.scene);
    const helper = new SelectionHelper(
      selectionBox,
      this.renderer
    );

    this.domElement.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const rect = this.domElement.getBoundingClientRect();
      selectionBox.startPoint.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
        0.5
      );
    });

    this.domElement.addEventListener("pointermove", (event) => {
      if (event.button !== 0) return;
      if (helper.isDown) {
        const rect = this.domElement.getBoundingClientRect();
        selectionBox.endPoint.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
          0.5
        );

        const allSelected = selectionBox.select(selectionBox.startPoint, selectionBox.endPoint);
        log(allSelected.map((obj) => ({ [obj.parent.name]: obj.name })));
      }
    });

    this.domElement.addEventListener("pointerup", (event) => {
      if (event.button !== 0) return;
      const rect = this.domElement.getBoundingClientRect();
      selectionBox.endPoint.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
        0.5
      );

      const allSelected = selectionBox.select(selectionBox.startPoint, selectionBox.endPoint);
      log(allSelected.map((obj) => ({ [obj.parent.name]: obj.name })));
    });
  }

  initDragControls() {
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
  }

  activate(selectionMode: ) {
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
