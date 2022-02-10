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
import ThreeDancer from "./ThreeComponents/Dancer";
// states
import { reactiveState } from "core/state";

import Controls from "./Controls";
// controls to control the scene

import {
  updateFrameByTimeMap,
  interpolationPos,
  fadeStatus,
} from "../../core/utils/math";

import { setCurrentPos } from "../../slices/globalSlice";

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
    this.animateID = this.animate((clockDelta) => {});
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
    const { currentPos } = store.getState().global;

    this.objects = [];
    const geometry = new THREE.BoxGeometry(1, 8, 1);
    Object.entries(currentPos).forEach(([name, position], i) => {
      if (!name.includes("sw")) {
        // if (name.includes("191")) {
        // const newDancer = new ThreeDancer(this.scene, name);

        const newDancer = new Dancer(
          this.scene,
          name,
          "/asset/models/yellow_clean.glb"
        );
        const newPos = {
          x: position.x / 30,
          y: 0,
          z: position.z / 30,
        };

        newDancer.addModel2Scene(newPos);
        this.dancers[name] = newDancer;

        // Add a box for control
        const object = new THREE.Mesh(
          geometry,
          new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
        );
        object.position.set(position.x / 30, 4, position.z / 30);
        object.userData["name"] = name;
        newDancer.controlBox = object;
        object.visible = false;
        this.objects.push(object);
        this.scene.add(object);
      }
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
    const newPosFrame = updateFrameByTimeMap(
      state.posRecord,
      state.posMap,
      state.timeData.posFrame,
      time
    );
    state.timeData.posFrame = newPosFrame;
    // position interpolation
    if (newPosFrame === state.posRecord.length - 1) {
      // can't interpolation
      state.currentPos = state.posMap[state.posRecord[newPosFrame]].pos;
    } else {
      // do interpolation
      state.currentPos = interpolationPos(
        time,
        state.posMap[state.posRecord[newPosFrame]],
        state.posMap[state.posRecord[newPosFrame + 1]]
      );
    }

    state.currentPos.x /= 35;
    state.currentPos.z /= 35;
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
      const newPos = {
        x: state.currentPos[dancer.name].x / 30,
        y: 0,
        z: state.currentPos[dancer.name].z / 30,
      };
      dancer.update(newPos, state.currentStatus[dancer.name]);
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
    if (this.initialized()) {
      Object.values(this.dancers).forEach((dancer) => {
        const { nameTag } = dancer;
        nameTag.lookAt(this.camera.position);
      });
    }

    requestAnimationFrame(() => this.animate(animation));
  }

  // fetch controlRecord, controlMap, posRecord, and set Start time
  fetch() {
    const { timeData, controlRecord, controlMap, posRecord, posMap } =
      store.getState().global;
    this.waveSuferTime = timeData.time;
    this.state = { controlRecord, controlMap, posRecord, posMap };
    this.state.timeData = { ...timeData };
  }

  playPause(isPlaying) {
    this.isPlaying = isPlaying;
    if (isPlaying) this.startTime = performance.now();
  }

  // render current scene and dancers
  render() {
    this.renderer?.render(this.scene, this.camera);
  }
}

export default ThreeController;

export const threeController = new ThreeController();
