import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";

import Stats from "three/examples/jsm/libs/stats.module";
// import { GPUStatsPanel } from "three/examples/jsm/utils/GPUStatsPanel";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";

import { setItem, getItem } from "../../utils/localStorage";
// redux actions and store
import { posInit, controlInit } from "../../slices/globalSlice";
import store from "../../store";
// components

import ThreeDancer from "./threeComponents/Dancer";
import ThreeSword from "./threeComponents/Sword";

import {
  updateFrameByTime,
  interpolationPos,
  fadeStatus,
} from "../../utils/math";

// const fov = 75;
// const aspect = 2; // the canvas default
// const near = 0.1;
// const far = 100;

const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.2;
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

    THREE.Cache.enabled = true;

    const pixelRatio = window.devicePixelRatio;
    let AA = true;
    if (pixelRatio > 1) {
      AA = false;
    }
    const renderer = new THREE.WebGLRenderer({
      antialias: AA,
      powerPreference: "high-performance",
    });
    renderer.setSize(this.width, this.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderer = renderer;

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    // controls.screenSpacePanning = true;
    controls.target.set(
      -0.7125719340319995,
      2.533987823530335,
      -0.07978443261089622
    );
    controls.position0.set(
      -4.4559744063642555,
      2.128295812145451,
      16.22834309576409
    );

    controls.update();

    this.controls = controls;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00000);

    // const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 10);
    // scene.add(light);

    // const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    // scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(-1, 1, 1);
    scene.add(directionalLight);

    // const grid = new THREE.GridHelper(25, 25, 0x888888, 0x444444);
    // scene.add(grid);

    this.scene = scene;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const pass = new SMAAPass(
      window.innerWidth * renderer.getPixelRatio(),
      window.innerHeight * renderer.getPixelRatio()
    );
    composer.addPass(pass);
    this.composer = composer;

    this.clock = new THREE.Clock();

    this.canvas.appendChild(renderer.domElement);

    // initialization for dancers

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
        console.log(name);
      }
    });

    const newSword = new ThreeSword(this.scene, "sword");
    const newPos = {
      x: 0,
      y: 0,
      z: 0,
    };
    newSword.addModel2Scene(newPos);

    const params = {
      color: 0x000000,
    };

    const gui = new GUI();
    gui.addColor(params, "color").onChange(function (value) {
      scene.background.set(value);
    });

    this.animateID = requestAnimationFrame(() =>
      this.animate((clockDelta) => {
        return;
      })
    );

    // Add stats to monitor fps
    const stats = new Stats();
    document.body.appendChild(stats.domElement);

    // const gpuPanel = new GPUStatsPanel(renderer.getContext());
    // stats.addPanel(gpuPanel);
    // stats.showPanel(0);
    // this.stats = stats;
    // this.gpuPanel = gpuPanel;

    requestAnimationFrame(function loop() {
      stats.update();
      requestAnimationFrame(loop);
    });
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
    // this.gpuPanel.startQuery();
    this.renderer.render(this.scene, this.camera);
    // this.gpuPanel.endQuery();

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
