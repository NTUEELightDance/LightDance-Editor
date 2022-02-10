import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";

import store from "../../../store";

import { setCurrentPos, setSelected } from "../../../slices/globalSlice";

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

  enableOrbitControls() {
    this.orbitControls.enabled = true;
  }
  disableOrbitControls() {
    this.orbitControls.enabled = false;
  }

  initDragControls() {
    this.objects = Object.values(this.dancers).map((dancer) => dancer.model);
    this.enableSelection = false;
    this.enableMultiSelection = false;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    // this.objects = Object.values(this.dancers).map((dancer) => dancer.model);
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.dragControls = new DragControls(
      [...this.objects],
      this.camera,
      this.renderer.domElement
    );
    this.dragControls.enabled = false;

    this.dragControls.addEventListener("dragend", this.dragEnd.bind(this));
  }

  initDanceSelector() {
    addEventListener("click", this.onClick.bind(this));
    addEventListener("keydown", this.onKeyDown.bind(this));
    addEventListener("keyup", this.onKeyUp.bind(this));
  }

  onKeyDown(event) {
    // hold ctrl to enable grouping
    if (event.keyCode === 17 || event.keyCode === 91) {
      this.enableMultiSelection = true;
    }
    // press v to enable moving
    if (event.keyCode === 86) {
      // this.dragControls.enabled = true;
      this.dragControls.enabled = !this.dragControls.enabled;
      this.enableSelection = !this.dragControls.enabled;
      console.log(this.dragControls.enabled, this.enableSelection);
      console.log(this.group);
      // this.orbitControls.enabled = false;
      if (this.dragControls.enabled) this.disableOrbitControls();
      else this.enableOrbitControls();
    }
  }

  onKeyUp(event) {
    if (event.keyCode === 17 || event.keyCode === 91) {
      this.enableMultiSelection = false;
    }
    // if (event.keyCode === 86) {
    //   this.dragEnd();
    //   this.dragControls.enabled = false;
    //   this.enableSelection = true;
    //   this.enableOrbitControls();
    // }
  }

  dragEnd() {
    const selected = [];
    while (this.group.children.length) {
      selected.push(this.group.children[0].name);
      this.scene.attach(this.group.children[0]);
    }
    this.group.position.set(0, 0, 0);

    const currentPos = {};
    Object.entries(this.dancers).forEach(([name, dancer], i) => {
      const { position } = dancer.model;

      currentPos[name] = {
        x: position.x * 30,
        y: position.z * 30,
        z: position.z * 30,
      };

      if (selected.includes(name)) {
        this.group.attach(dancer.model);
      }
    });
    store.dispatch(setCurrentPos(currentPos));
  }

  onClick(event) {
    if (!this.enableSelection) return;
    event.preventDefault();
    console.log(`onClick: ${this.enableSelection}`);

    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersections = this.raycaster.intersectObjects(this.objects, true);
    console.log(intersections);

    if (intersections.length > 0) {
      const draggableObjects = this.dragControls.getObjects();
      draggableObjects.length = 0;
      const object = intersections[0].object.parent;
      const { name } = object;

      if (this.enableMultiSelection) {
        // Cancel selection
        if (this.group.children.includes(object) === true) {
          this.dancers[name].unselect();
          this.scene.attach(object);
        }
        // Add selection
        else {
          this.dancers[name].select();
          this.group.attach(object);
        }
      } else {
        while (this.group.children.length) {
          const object = this.group.children[0];
          const { name } = object;
          this.dancers[name].unselect();
          this.scene.attach(object);
        }

        // Add selection
        this.dancers[name].select();
        this.group.attach(object);
      }

      this.dragControls.transformGroup = true;
      draggableObjects.push(this.group);
      const selected = this.group.children.map((child) => child.name);
      store.dispatch(setSelected(selected));
    }
  }
}

export default Controls;
