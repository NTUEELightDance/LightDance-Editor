import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";

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
    if (this.dragControls) {
      console.log("DragControls already initialized...");
    }
    this.objects = Object.values(this.dancers).map((dancer) => dancer.model);
    this.enableSelection = false;
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

    // this.dragControls.addEventListener("dragend", (event) => {
    //   console.log(this.group);
    //   console.log(event);
    // });

    addEventListener("click", this.onClick.bind(this));
    addEventListener("keydown", this.onKeyDown.bind(this));
    addEventListener("keyup", this.onKeyUp.bind(this));
  }

  onKeyDown(event) {
    // hold ctrl to enable grouping
    if (event.keyCode === 17 || event.keyCode === 91) {
      this.enableSelection = true;
    }
    // press v to enable moving
    if (event.keyCode === 86) {
      this.dragControls.enabled = true;
      // this.orbitControls.enabled = false;
      this.disableOrbitControls();
    }
  }

  onKeyUp(event) {
    if (event.keyCode === 17 || event.keyCode === 91) {
      this.enableSelection = false;
    }
    if (event.keyCode === 86) {
      this.dragControls.enabled = false;
      this.enableOrbitControls();
    }
  }

  onClick(event) {
    event.preventDefault();
    console.log(`onClick: ${this.enableSelection}`);

    const draggableObjects = this.dragControls.getObjects();
    draggableObjects.length = 0;

    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersections = this.raycaster.intersectObjects(this.objects, true);
    console.log(intersections);

    if (intersections.length > 0) {
      const object = intersections[0].object.parent;
      const { name } = object;
      console.log(object);
      // const dancer = object.parent

      if (this.enableSelection === true) {
        // Cancel selection
        if (this.group.children.includes(object) === true) {
          // object.material.emissive.set(0x000000);
          this.dancers[name].nameTag.material.color.setRGB(0, 0.4, 0.6);
          this.scene.attach(object);
        }
        // Add selection
        else {
          // object.material.emissive.set(0xaaaaaa);
          this.dancers[name].nameTag.material.color.setRGB(1, 1, 1);
          this.group.attach(object);
          // this.group.attach(this.dancers[object.userData.name].model);
        }
      } else {
        while (this.group.children.length) {
          const object = this.group.children[0];
          const { name } = object;
          this.dancers[name].nameTag.material.color.setRGB(0, 0.4, 0.6);
          // object.material.emissive.set(0x000000);
          this.scene.attach(object);
        }

        // Add selection
        // object.material.emissive.set(0xaaaaaa);
        this.dancers[name].nameTag.material.color.setRGB(1, 1, 1);
        this.group.attach(object);
        // this.group.attach(this.dancers[object.userData.name].model);
      }

      this.dragControls.transformGroup = true;
      draggableObjects.push(this.group);
    } else {
      while (this.group.children.length) {
        const object = this.group.children[0];
        const { name } = object;
        // object.material.emissive.set(0x000000);
        this.dancers[name].nameTag.material.color.setRGB(0, 0.4, 0.6);
        this.scene.attach(object);
      }
    }

    if (this.group.children.length === 0) {
      this.dragControls.transformGroup = false;
      draggableObjects.push(...this.objects);
    }
  }
}

export default Controls;
