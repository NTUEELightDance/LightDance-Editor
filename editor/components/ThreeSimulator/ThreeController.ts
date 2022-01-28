import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// three.js

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
// postprocessing for three.js

import Stats from "three/examples/jsm/libs/stats.module";
// performance monitor

//? gui is working but does not come with a type even after installing @types/three
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
// three gui

import { setItem, getItem } from "../../utils/localStorage";
// redux actions and store
import { posInit, controlInit } from "../../slices/globalSlice";
import store from "../../store";
// components

import ThreeDancer from "./ThreeComponents/Dancer";

import {
  updateFrameByTimeMap,
  updateFrameByTime,
  interpolationPos,
  fadeStatus,
} from "../../utils/math";

const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.2;
const far = 100;

/**
 * Control the dancers (or other light objects)'s status and pos
 * @constructor
 */
class ThreeController {
  canvas: HTMLElement;
  container: HTMLElement;

  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
  controls: OrbitControls | null;
  // THREE.Object3D<THREE.Event>
  scene: THREE.Scene | null;
  composer: EffectComposer | null;
  clock: THREE.Clock | null;

  height: number;
  width: number;

  dancers: { [index: string]: ThreeDancer };

  //TODO use global state type
  state: any;
  isPlaying: boolean;
  //? seems always undefined, not sure why its here
  animateID: any;

  constructor(canvas: HTMLElement, container: HTMLElement) {
    // canvas: for 3D rendering, container: for performance monitor
    this.canvas = canvas;
    this.container = container;

    // Basic attributes for three.js
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.scene = null;
    this.composer = null;
    this.clock = null;

    // Configuration of the scene
    this.height = 500;
    this.width = 1500;

    // Dancer
    this.dancers = {};

    // Data and status for playback
    this.state = {};
    this.isPlaying = false;

    // record the return id of requestAnimationFrame
    this.animateID = null;
  }

  /**
   * Initiate localStorage, threeApp, dancers
   */
  init() {
    THREE.Cache.enabled = true;

    // Set best configuration for different monitor devices
    const pixelRatio = window.devicePixelRatio;
    let AA = true;
    if (pixelRatio > 1) {
      AA = false;
    }

    // Initilization of 3D renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: AA,
      powerPreference: "high-performance",
    });

    renderer.setSize(this.width, this.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer = renderer;

    // Add a camera to view the scene, all the parameters are customizable
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(
      -0.27423481610277156,
      3.9713106563331033,
      17.22495526821853
    );
    camera.quaternion.set(
      0.9990621561475012,
      -0.04140624566400079,
      0.012651325861071754,
      0.0005243356515463121
    );
    camera.rotation.set(
      -0.08286926974888807,
      0.025238179467967838,
      0.0020960446794741658
    );
    camera.aspect = this.width / this.height;
    camera.updateProjectionMatrix();
    this.camera = camera;

    // Add a orbit control to view the scene from different perspectives and scales
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    // controls.screenSpacePanning = true;
    controls.target.set(
      -0.7125719340319995,
      2.533987823530335,
      -0.07978443261089622
    );
    //? there is no such property on the controller
    // controls.position0.set(
    //   -4.4559744063642555,
    //   2.128295812145451,
    //   16.22834309576409
    // );
    controls.update();
    this.controls = controls;

    // Add a background scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00000);

    // Add a dim light to identity each dancers
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(-1, 1, 1);
    scene.add(directionalLight);

    this.scene = scene;

    // Postprocessing for antialiasing effect
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const pass = new SMAAPass(
      window.innerWidth * renderer.getPixelRatio(),
      window.innerHeight * renderer.getPixelRatio()
    );
    composer.addPass(pass);
    this.composer = composer;

    // Set the clock for animation
    this.clock = new THREE.Clock();

    // Append the canvas to given ref
    this.canvas.appendChild(renderer.domElement);

    // Initialization of all dancers with currentPos
    const { currentPos } = store.getState().global;

    Object.entries(currentPos).forEach(([name, position], i) => {
      if (!name.includes("sw")) {
        const newDancer = new ThreeDancer(this.scene, name);
        const newPos = {
          x: position.x / 35,
          y: 0,
          z: position.z / 35,
        };
        newDancer.addModel2Scene(newPos);
        this.dancers[name] = newDancer;
      }
    });

    // add gui to adjust parameters
    // this.gui();

    // start rendering
    this.animateID = this.animate((clockDelta) => {});
    this.renderer.render(this.scene, this.camera);

    // monitor perfomance and delay
    this.monitor();
  }

  // Return true if all the dancer is successfully initialized
  initialized() {
    return Object.values(this.dancers).every((dancer) => dancer.initialized);
  }

  // Monitor fps, memory and delay
  monitor() {
    const statsPanel = Stats();
    statsPanel.domElement.style.position = "absolute";
    this.container.appendChild(statsPanel.domElement);

    requestAnimationFrame(function loop() {
      statsPanel.update();
      requestAnimationFrame(loop);
    });
  }

  // gui to change paramters including color, positon, controlls
  gui() {
    this.params = {
      color: 0x000000,
    };

    const gui = new GUI();
    gui.addColor(this.params, "color").onChange((value) => {
      this.scene.background.set(value);
    });
  }

  // calculate and set next frame status according to time and call updateDancers
  update(clockDelta) {
    // calculate simluation time + waveSurferTime to find the latset frame
    const time = this.waveSuferTime + performance.now() - this.startTime;
    const { state } = this;

    // set timeData.controlFrame and currentStatus
    const newControlFrame = updateFrameByTimeMap(
      state.controlRecord,
      state.controlMap,
      state.timeData.controlFrame,
      time
    );

    state.timeData.controlFrame = newControlFrame;

    // status fade
    if (newControlFrame === state.controlRecord.length - 1) {
      // Can't fade
      state.currentStatus =
        state.controlMap[state.controlRecord[newControlFrame]].status;
    } else {
      // do fade
      state.currentStatus = fadeStatus(
        time,
        state.controlMap[state.controlRecord[newControlFrame]],
        state.controlMap[state.controlRecord[newControlFrame + 1]]
      );
    }

    // set timeData.posFrame and currentPos
    const newPosFrame = updateFrameByTime(
      state.posRecord,
      state.timeData.posFrame,
      time
    );
    state.timeData.posFrame = newPosFrame;
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
    state.currentFade =
      state.controlMap[state.controlRecord[newControlFrame]].fade;

    // update threeDancers staus and position
    this.updateDancers();
  }

  // call each dancers's update
  updateDancers() {
    const { state } = this;
    Object.values(this.dancers).forEach((dancer) => {
      dancer.update(
        state.currentPos[dancer.name],
        state.currentStatus[dancer.name]
      );
    });
  }

  // a recursive function to render each new frame
  animate(animation) {
    this.renderer.render(this.scene, this.camera);

    if (this.isPlaying) {
      this.update(this.clock?.getDelta());
    } else {
      cancelAnimationFrame(this.animateID);
    }
    requestAnimationFrame(() => this.animate(animation));
  }

  // fetch controlRecord, controlMap, posRecord, and set Start time
  fetch() {
    const { timeData, controlRecord, controlMap, posRecord } =
      store.getState().global;
    this.startTime = performance.now();
    this.waveSuferTime = timeData.time;
    this.state = { controlRecord, controlMap, posRecord };
    this.state.timeData = { ...timeData };
  }

  // render current scene and dancers
  render() {
    this.renderer?.render(this.scene, this.camera);
  }
}

export default ThreeController;
