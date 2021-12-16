import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { setItem, getItem } from "../../utils/localStorage";
// redux actions and store
import { posInit, controlInit } from "../../slices/globalSlice";
import store from "../../store";
// components

import ThreeDancer from "../threeSimulator/threeComponents/Dancer";

const fov = 75;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 100;

// import {
//   updateFrameByTime,
//   interpolationPos,
//   fadeStatus,
// } from "../../utils/math";
/**
 * Control the dancers (or other light objects)'s status and pos
 * @constructor
 */
class ThreeController {
  constructor(canvas) {
    this.dancers = {};
    this.mainContainer = null;
    this.threeApp = {};
    this.canvas = canvas;
    this.height = 500;
    this.width = 500;
    this.isPlaying = false;
    this.animateID = null;
    this.dancers = {};
  }

  /**
   * Initiate localStorage, waveSurferApp, PixiApp, dancers
   */
  init() {
    // initialization by localStorage
    if (!getItem("control")) {
      setItem("control", JSON.stringify(store.getState().load.control));
    }
    if (!getItem("position")) {
      setItem("position", JSON.stringify(store.getState().load.position));
    }
    store.dispatch(controlInit(JSON.parse(getItem("control"))));
    store.dispatch(posInit(JSON.parse(getItem("position"))));

    // initialization for Three
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(this.width, this.height);
    this.renderer = renderer;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 10);

    camera.aspect = this.width / this.height;
    camera.updateProjectionMatrix();

    this.camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.target.set(0, 1, 0);
    controls.update();

    this.controls = controls;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7b7b7b);
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 3);
    scene.add(light);
    this.scene = scene;

    this.clock = new THREE.Clock();
    console.log(this.clock);

    this.canvas.appendChild(renderer.domElement);

    // initialization for dancers

    const { currentPos } = store.getState().global;

    // const position1 = {
    //   x: currentPos["1_191"].x / 100,
    //   y: currentPos["1_191"].y / 100,
    //   z: currentPos["1_191"].z / 100,
    // };
    // const newDancer1 = new ThreeDancer(this.scene);
    // newDancer1.addModel2Scene(position1);

    // const newDancer2 = new ThreeDancer(this.scene);
    // newDancer2.addModel2Scene({ x: -3, y: 0, z: 0 });

    // console.log(currentPos);

    Object.entries(currentPos).forEach(([name, position], i) => {
      if (!name.includes("sw")) {
        const newDancer = new ThreeDancer(this.scene);
        const newPos = {
          x: position.x / 100,
          y: 0,
          z: position.z / 100,
        };
        newDancer.addModel2Scene(newPos);
        this.dancers[name] = newDancer;
        console.log(name);
      }
    });

    this.animateID = requestAnimationFrame(() =>
      this.animate((clockDelta) => {
        return;
      })
    );
  }

  updatePos(clockDelta) {}

  animate(animation) {
    this.updatePos(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
    if (this.isPlaying) {
      console.log(this.isPlaying);
    } else {
      cancelAnimationFrame(this.animateID);
    }

    requestAnimationFrame(() => this.animate(animation));
  }

  addObject(object) {
    this.scene.add(object);
  }

  cleanUp() {
    this.canvas.removeChild(this.renderer.domElement);
  }
}

export default ThreeController;
