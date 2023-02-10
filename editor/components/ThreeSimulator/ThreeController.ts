import * as THREE from "three";
// three.js

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

// postprocessing for three.js

import { GridHelper } from "./Helper/GridHelper";

import Stats from "three/examples/jsm/libs/stats.module";
// performance monitor

import { Dancer } from "./ThreeComponents";
// components

import Controls from "./Controls";
// controls to control the scene

import Settings from "./Settings";

import { state } from "core/state";
// states

import store from "../../store";
import {
  ControlMapStatus,
  CurrentLedEffect,
  DancerCoordinates,
  Selected,
} from "@/core/models";

/**
 * Control the dancers (or other light objects)'s status and pos
 * @constructor
 */
class ThreeController {
  canvas?: HTMLElement;
  container?: HTMLElement;

  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  // THREE.Object3D<THREE.Event>
  scene: THREE.Scene;
  composer: EffectComposer;
  clock: THREE.Clock;
  settings: Settings;

  height: number;
  width: number;

  dancers: Record<string, Dancer>;
  gridHelper: GridHelper;
  light: THREE.DirectionalLight;

  selectedOutline: OutlinePass;
  hoveredOutline: OutlinePass;
  manager: THREE.LoadingManager;
  controls: Controls;

  // TODO use global state type
  state: any;
  isPlaying: boolean;
  // ? seems always undefined, not sure why its here
  initialized: boolean;

  constructor() {
    // Configuration of the scene
    this.height = 100;
    this.width = 200;

    // Basic attributes for three.js
    this.renderer = this.generateRenderer();
    this.camera = this.generateCamera();
    this.scene = this.generateScene();
    this.selectedOutline = this.generateSelectedOutline();
    this.hoveredOutline = this.generateHoverOutline();
    this.composer = this.generateComposer();
    this.clock = new THREE.Clock();
    this.settings = new Settings(this);
    this.light = this.generateLight();
    this.gridHelper = this.generateGridHelper();
    this.initCenterMarker();
    this.manager = this.generateLoadManager();
    this.controls = null;

    // Dancer
    this.dancers = {};

    // Data and status for playback
    this.state = {};
    this.isPlaying = false;

    // record the return id of requestAnimationFrame
    this.initialized = false;
  }

  /**
   * Initiate localStorage, threeApp, dancers
   */
  init(canvas: HTMLElement, container: HTMLElement) {
    // canvas: for 3D rendering, container: for performance monitor
    this.canvas = canvas;
    this.container = container;

    // Set canvas size
    const { width, height } = container.getBoundingClientRect();
    this.width = width;
    this.height = height;
    this.renderer.setSize(this.width, this.height);

    THREE.Cache.enabled = true;

    // Initialization of 3D renderer

    // Add a camera to view the scene, all the parameters are customizable

    // Add a background scene

    // Add a dim light to identity each dancers

    // Postprocessing for anti-aliasing effect
    this.composer = this.generateComposer();

    // Set the clock for animation

    // Append the canvas to given ref
    this.canvas.appendChild(this.renderer.domElement);

    // Initialization of all dancers with currentPos
    this.initDancers();

    // Initialization of grid helper on the floor

    // Start rendering
    this.animate();
    this.renderer.render(this.scene, this.camera);

    // Monitor performance and delay
    this.monitor();
  }

  generateRenderer() {
    // Set best configuration for different monitor devices
    const pixelRatio = window.devicePixelRatio;

    // Initialization of 3D renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;

    return renderer;
  }

  generateScene() {
    // Add a background scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    return scene;
  }

  generateLight() {
    // Add a dim light to identity each dancers
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 0);
    this.scene.add(directionalLight);
    return directionalLight;
  }

  generateCamera() {
    const fov = 45;
    const aspect = this.width / this.height;
    const near = 0.2;
    const far = 300;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(
      -0.12537511037946858,
      4.4594268691037255,
      23.101661470178215
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
    return camera;
  }

  generateSelectedOutline() {
    const selectedOutline = new OutlinePass(
      new THREE.Vector2(this.width, this.height),
      this.scene,
      this.camera
    );

    selectedOutline.edgeStrength = 2.0;
    selectedOutline.edgeThickness = 1.0;
    selectedOutline.visibleEdgeColor.set(0xffffff);
    selectedOutline.hiddenEdgeColor.set(0x222222);

    return selectedOutline;
  }
  generateHoverOutline() {
    const hoveredOutline = new OutlinePass(
      new THREE.Vector2(this.width, this.height),
      this.scene,
      this.camera
    );

    hoveredOutline.edgeStrength = 2.0;
    hoveredOutline.edgeThickness = 1.0;
    hoveredOutline.visibleEdgeColor.set(0xffff00);

    return hoveredOutline;
  }
  generateComposer() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const renderTarget = new THREE.WebGLMultisampleRenderTarget(
      size.width,
      size.height
    );

    const composer = new EffectComposer(this.renderer, renderTarget);

    // default render pass for post processing
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    composer.addPass(this.selectedOutline);
    composer.addPass(this.hoveredOutline);

    return composer;
  }

  initDancers() {
    const { dancerNames, currentStatus, currentPos } = state;
    const { dancerMap } = store.getState().load;

    dancerNames.forEach((name) => {
      const { url } = dancerMap[name];
      const newDancer = new Dancer(this.scene, name, url, this.manager);
      newDancer.addModel2Scene(currentStatus[name], currentPos[name]);
      this.dancers[name] = newDancer;
    });
  }

  generateGridHelper() {
    const gridHelper = new GridHelper(60, 20);
    gridHelper.matrixAutoUpdate = false;
    this.scene.add(gridHelper);
    return gridHelper;
  }

  // Add a center marker in the middle
  initCenterMarker() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 2.5);
    const material = new THREE.MeshBasicMaterial({ color: 0x59b6e7 });
    const cube = new THREE.Mesh(geometry, material);

    cube.matrix.setPosition(0, 0, 12.5);
    cube.matrixAutoUpdate = false;
    cube.name = "Center";

    this.scene.add(cube);
  }

  generateLoadManager() {
    const manager = new THREE.LoadingManager();
    manager.onLoad = this.initControls.bind(this);
    return manager;
  }

  initControls() {
    // Add a orbit control to view the scene from different perspectives and scales
    this.controls = new Controls(
      this.renderer,
      this.scene,
      this.camera,
      this.dancers
    );
    this.controls.selectControls.setSelectedOutline(this.selectedOutline);
  }

  // Return true if all the dancer is successfully initialized
  isInitialized() {
    if (!this.initialized) {
      this.initialized =
        Object.values(this.dancers).every((dancer) => dancer.initialized) &&
        Object.values(this.dancers).length !== 0;
    }
    return this.initialized;
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(width, height);
    this.renderer.setSize(width, height);
    this.composer?.setPixelRatio(window.devicePixelRatio);
  }

  // Monitor fps, memory and delay
  monitor() {
    const statsPanel = Stats();
    statsPanel.domElement.style.position = "absolute";
    this.container?.appendChild(statsPanel.domElement);

    requestAnimationFrame(function loop() {
      statsPanel.update();
      requestAnimationFrame(loop);
    });
  }

  updateSelected(selected: Selected) {
    if (Object.entries(selected).length === 0) {
      throw new Error(
        "[Error] updateDancersStatus, invalid parameter(currentStatus)"
      );
    }
    this.controls.selectControls.updateSelected(selected);
  }

  // calculate and set next frame status according to time and call updateDancers
  update() {
    this.updateDancersStatus(state.currentStatus);
    // this.updateDancerLED(state.currentLedEffect);

    this.updateDancersPos(state.currentPos);
  }

  updateDancersStatus(currentStatus: ControlMapStatus) {
    if (Object.entries(currentStatus).length === 0) {
      throw new Error(
        "[Error] updateDancersStatus, invalid parameter(currentStatus)"
      );
    }
    if (!this.settings.config.Visibility.FIBER) return;
    Object.entries(currentStatus).forEach(([dancerName, status]) => {
      this.dancers[dancerName].setFiberStatus(status);
    });
  }

  updateDancerLED(currentLedEffect: CurrentLedEffect) {
    if (Object.entries(currentLedEffect).length === 0) {
      throw new Error(
        "[Error] updateDancersLED, invalid parameter(currentLedEffect)"
      );
    }
    if (!this.settings.config.Visibility.LED) return;
    Object.entries(currentLedEffect).forEach(([dancerName, status]) => {
      this.dancers[dancerName].setLEDStatus(status);
    });
  }

  updateDancersPos(currentPos: DancerCoordinates) {
    if (Object.entries(currentPos).length === 0) {
      throw new Error(
        "[Error] updateDancersPos, invalid parameter(currentPos)"
      );
    }
    Object.entries(currentPos).forEach(([key, value]) => {
      this.dancers[key].setPos(value);
    });
  }

  // a recursive function to render each new frame
  animate() {
    if (this.isInitialized()) {
      this.update();
      Object.values(this.dancers).forEach((dancer) => {
        const { nameTag } = dancer;
        nameTag.lookAt(this.camera.position);
      });
    }

    this.composer?.render();
    requestAnimationFrame(() => {
      this.animate();
    });
  }

  // change isPlaying status

  setIsPlaying(isPlaying: boolean) {
    this.isPlaying = isPlaying;
  }

  // render current scene and dancers
  render() {
    if (!this.isPlaying) this.composer.renderer.render(this.scene, this.camera);
    else this.renderer?.render(this.scene, this.camera);
  }
}

export default ThreeController;

export const threeController = new ThreeController();
