import * as THREE from "three";
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

// redux actions and store
import store from "../../store";
// components
import { Dancer } from "./ThreeComponents";
// states
import { state } from "core/state";

import Controls from "./Controls";
// controls to control the scene

import {
  updateFrameByTimeMap,
  interpolationPos,
  fadeStatus,
} from "../../core/utils/math";

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

  constructor() {
    // Basic attributes for three.js
    this.renderer = null;
    this.camera = null;
    this.orbitControls = null;
    this.scene = null;
    this.composer = null;
    this.clock = null;

    // Configuration of the scene
    this.height = 600;
    this.width = 1200;

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
  init(canvas: HTMLElement, container: HTMLElement) {
    // canvas: for 3D rendering, container: for performance monitor
    this.canvas = canvas;
    this.container = container;

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
    this.initCamera();

    // Add a background scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    this.scene = scene;

    // Add a dim light to identity each dancers
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(-1, 1, 1);
    scene.add(directionalLight);

    // Postprocessing for antialiasing effect
    this.initPostprocessing();

    // Set the clock for animation
    this.clock = new THREE.Clock();

    // Append the canvas to given ref
    this.canvas.appendChild(renderer.domElement);

    // Initialization of all dancers with currentPos
    this.initDancers();

    // Add a orbit control to view the scene from different perspectives and scales
    this.controls = new Controls(
      this.renderer,
      this.scene,
      this.camera,
      this.dancers
    );

    // Initialization of grid helper on the floor
    this.initGridHelper();

    // Add gui to adjust parameters
    // this.gui();

    // Start rendering
    this.animateID = this.animate();
    this.renderer.render(this.scene, this.camera);

    // Monitor perfomance and delay
    this.monitor();
  }

  initCamera() {
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
  }

  initPostprocessing() {
    // Postprocessing for antialiasing effect
    const composer = new EffectComposer(this.renderer);
    composer.addPass(new RenderPass(this.scene, this.camera));

    const pass = new SMAAPass(
      window.innerWidth * this.renderer.getPixelRatio(),
      window.innerHeight * this.renderer.getPixelRatio()
    );
    composer.addPass(pass);
    this.composer = composer;
  }

  initDancers() {
    const { dancerNames } = store.getState().load;
    const { currentStatus, currentPos } = state;

    dancerNames.forEach((name) => {
      const newDancer = new Dancer(
        this.scene,
        name,
        "/asset/models/yellow_clean.glb"
      );
      newDancer.addModel2Scene(currentStatus[name], currentPos[name]);
      this.dancers[name] = newDancer;
    });
  }

  initGridHelper() {
    const helper = new THREE.GridHelper(30, 10);
    this.scene.add(helper);
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
    this.updateDancersStatus(state.currentStatus);
    this.updateDancersPos(state.currentPos);
  }

  // call each dancers's update
  updateDancers() {
    const { state } = this;
    Object.values(this.dancers).forEach((dancer) => {
      const newPos = {
        x: state.currentPos[dancer.name].x / 30,
        y: 0,
        z: state.currentPos[dancer.name].z / 30,
      };
      dancer.update(newPos, state.currentStatus[dancer.name]);
    });
  }

  updateDancersStatus(currentStatus) {
    if (Object.entries(currentStatus).length === 0)
      throw new Error(
        `[Error] updateDancersStatus, invalid parameter(currentStatus)`
      );
    Object.entries(currentStatus).forEach(([key, value]) => {
      this.dancers[key].setStatus(value);
    });
  }

  updateDancersPos(currentPos) {
    if (Object.entries(currentPos).length === 0)
      throw new Error(
        `[Error] updateDancersPos, invalid parameter(currentPos)`
      );
    Object.entries(currentPos).forEach(([key, value]) => {
      this.dancers[key].setPos(value);
    });
  }

  // a recursive function to render each new frame
  animate() {
    this.renderer.render(this.scene, this.camera);

    if (this.initialized()) {
      Object.values(this.dancers).forEach((dancer) => {
        const { nameTag } = dancer;
        nameTag.lookAt(this.camera.position);
      });
      this.update(this.clock?.getDelta());
    }

    requestAnimationFrame(() => this.animate());
  }

  // fetch controlRecord, controlMap, posRecord, and set Start time
  fetch() {
    const { timeData, controlRecord, controlMap, posRecord, posMap } =
      store.getState().global;
    this.waveSuferTime = timeData.time;
    this.state = { controlRecord, controlMap, posRecord, posMap };
    this.state.timeData = { ...timeData };
  }

  play() {
    // this.animateID = this.animate();
    this.isPlaying = true;
  }

  stop() {
    this.isPlaying = false;
    // cancelAnimationFrame(this.animateID);
  }

  // render current scene and dancers
  render() {
    this.renderer?.render(this.scene, this.camera);
  }
}

export default ThreeController;

export const threeController = new ThreeController();
