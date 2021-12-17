import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { setItem, getItem } from "../../utils/localStorage";
// redux actions and store
import { posInit, controlInit } from "../../slices/globalSlice";
import store from "../../store";
// components

import ThreeDancer from "./threeComponents/Dancer";

import {
  updateFrameByTime,
  interpolationPos,
  fadeStatus,
} from "../../utils/math";

const fov = 75;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 100;

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
    this.width = 1000;
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

    const pixelRatio = window.devicePixelRatio;
    let AA = true;
    if (pixelRatio > 1) {
      AA = false;
    }
    const renderer = new THREE.WebGLRenderer({
      // antialias: true,
      antialias: AA,
      powerPreference: "high-performance",
    });
    renderer.setSize(this.width, this.height);
    renderer.setPixelRatio(window.devicePixelRatio / 1.3);
    renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderer = renderer;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 10);

    camera.aspect = this.width / this.height;
    camera.updateProjectionMatrix();

    this.camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    // controls.screenSpacePanning = true;
    controls.target.set(0, 1, 0);
    controls.update();

    this.controls = controls;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 3);
    // scene.add(light);

    const grid = new THREE.GridHelper(50, 50, 0x888888, 0x444444);

    scene.add(grid);

    this.scene = scene;

    this.clock = new THREE.Clock();

    this.canvas.appendChild(renderer.domElement);

    // initialization for dancers

    const { currentPos } = store.getState().global;

    Object.entries(currentPos).forEach(([name, position], i) => {
      if (!name.includes("sw")) {
        const newDancer = new ThreeDancer(this.scene, name);
        const newPos = {
          x: position.x / 30,
          y: 0,
          z: position.z / 30,
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

  update(clockDelta) {
    const time = this.waveSuferTime + performance.now() - this.startTime;

    const { state } = this;

    // set timeData.controlFrame and currentStatus
    const newControlFrame = updateFrameByTime(
      state.controlRecord,
      state.timeData.controlFrame,
      time
    );
    state.timeData.controlFrame = newControlFrame;
    // status fade
    if (newControlFrame === state.controlRecord.length - 1) {
      // Can't fade
      state.currentStatus = state.controlRecord[newControlFrame].status;
    } else {
      // do fade
      state.currentStatus = fadeStatus(
        time,
        state.controlRecord[newControlFrame],
        state.controlRecord[newControlFrame + 1]
      );
    }

    const newPosFrame = updateFrameByTime(
      state.posRecord,
      this.state.timeData.posFrame,
      time
    );
    this.state.timeData.posFrame = newPosFrame;
    // position interpolation
    if (newPosFrame === state.posRecord.length - 1) {
      // can't interpolation
      state.currentPos = state.posRecord[newPosFrame].pos;
    } else {
      // do interpolation
      state.currentPos = interpolationPos(
        time,
        state.posRecord[newPosFrame],
        state.posRecord[newPosFrame + 1]
      );
    }

    // set currentFade
    state.currentFade = state.controlRecord[newControlFrame].fade;

    Object.values(this.dancers).forEach((dancer) => {
      dancer.update(
        state.currentPos[dancer.name],
        state.currentStatus[dancer.name]
      );
    });
  }

  animate(animation) {
    this.renderer.render(this.scene, this.camera);
    if (this.isPlaying) {
      this.update(this.clock.getDelta());
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
