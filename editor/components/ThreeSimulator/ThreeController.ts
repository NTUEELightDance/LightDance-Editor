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

import { state } from "core/state";
// states

import Controls from "./Controls";
// controls to control the scene

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
  initialized: boolean;

  constructor() {
    // Basic attributes for three.js
    this.renderer = null;
    this.camera = null;
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

    THREE.Cache.enabled = true;

    // Set best configuration for different monitor devices
    const pixelRatio = window.devicePixelRatio;

    // Initilization of 3D renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
    });

    renderer.setSize(this.width, this.height);
    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderer = renderer;

    // Add a camera to view the scene, all the parameters are customizable
    this.initCamera();

    // Add a background scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    this.scene = scene;

    // Add a dim light to identity each dancers
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 0);
    this.light = directionalLight;
    scene.add(directionalLight);

    // Postprocessing for antialiasing effect
    this.initPostprocessing();

    // Set the clock for animation
    this.clock = new THREE.Clock();

    // Append the canvas to given ref
    this.canvas.appendChild(renderer.domElement);

    // Initialization of all dancers with currentPos
    this.initDancers();
    this.initCenterMarker();

    // Initialization of grid helper on the floor
    this.initGridHelper();

    // Start rendering
    this.animateID = this.animate();
    this.renderer.render(this.scene, this.camera);

    // Monitor perfomance and delay
    this.monitor();
  }

  initCamera() {
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
    this.camera = camera;
  }

  initPostprocessing() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const renderTarget = new THREE.WebGLMultisampleRenderTarget(
      size.width,
      size.height
    );

    const composer = new EffectComposer(this.renderer, renderTarget);

    // default render pass for post processing
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    const selectedOutline = new OutlinePass(
      new THREE.Vector2(this.width, this.height),
      this.scene,
      this.camera
    );
    composer.addPass(selectedOutline);

    selectedOutline.edgeStrength = 2.0;
    selectedOutline.edgeThickness = 1.0;
    selectedOutline.visibleEdgeColor.set(0xffffff);
    selectedOutline.hiddenEdgeColor.set(0x222222);

    const hoveredOutline = new OutlinePass(
      new THREE.Vector2(this.width, this.height),
      this.scene,
      this.camera
    );

    hoveredOutline.edgeStrength = 2.0;
    hoveredOutline.edgeThickness = 1.0;
    hoveredOutline.visibleEdgeColor.set(0xffff00);

    composer.addPass(hoveredOutline);

    // const copyPass = new ShaderPass(CopyShader);
    // composer.addPass(copyPass);

    this.selectedOutline = selectedOutline;
    this.hoveredOutline = hoveredOutline;
    this.composer = composer;
  }

  initDancers() {
    this.initLoadManager();

    const { dancerNames, currentStatus, currentPos } = state;

    dancerNames.forEach((name) => {
      let url;
      const index = Number(name.split("_")[0]);
      if (index <= 5 && index >= 0) {
        url = "/asset/models/yellow_with_visor_led.draco.glb";
        // url = "/asset/models/yellow.glb";
      } else if (index >= 6 && index <= 10) {
        url = "/asset/models/cyan.draco.glb";
        // url = "/asset/models/cyan.glb";
      } else if (index === 11) {
        url = "/asset/models/magenta.draco.glb";
        // url = "/asset/models/magenta.glb";
      }

      const newDancer = new Dancer(this.scene, name, url, this.manager);
      newDancer.addModel2Scene(currentStatus[name], currentPos[name]);
      this.dancers[name] = newDancer;
    });
  }

  initGridHelper() {
    const gridHelper = new GridHelper(60, 20);
    gridHelper.matrixAutoUpdate = false;
    this.gridHelper = gridHelper;
    this.scene.add(gridHelper);
  }

  initLoadManager() {
    const manager = new THREE.LoadingManager();
    manager.onLoad = this.initControls.bind(this);
    this.manager = manager;
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

  // Add a center marker in the middle
  initCenterMarker() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 2.5);
    const material = new THREE.MeshBasicMaterial({ color: 0x59b6e7 });
    const cube = new THREE.Mesh(geometry, material);

    cube.matrix.setPosition(0, 0, 12.5);
    cube.matrixAutoUpdate = false;

    this.scene.add(cube);
  }

  // Return true if all the dancer is successfully initialized
  isInitialized() {
    if (!this.initialized)
      this.initialized =
        Object.values(this.dancers).every((dancer) => dancer.initialized) &&
        Object.values(this.dancers).length !== 0;
    return this.initialized;
  }

  resize(width, height) {
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
    this.container.appendChild(statsPanel.domElement);

    requestAnimationFrame(function loop() {
      statsPanel.update();
      requestAnimationFrame(loop);
    });
  }

  updateSelected(selected) {
    if (Object.entries(selected).length === 0)
      throw new Error(
        `[Error] updateDancersStatus, invalid parameter(currentStatus)`
      );
    this.controls.selectControls.updateSelected(selected);
  }

  // calculate and set next frame status according to time and call updateDancers
  update(clockDelta) {
    this.updateDancersStatus(state.currentStatus);
    this.updateDancerLED(state.currentLedEffect);

    this.updateDancersPos(state.currentPos);
  }

  updateDancersStatus(currentStatus) {
    if (Object.entries(currentStatus).length === 0)
      throw new Error(
        `[Error] updateDancersStatus, invalid parameter(currentStatus)`
      );
    Object.entries(currentStatus).forEach(([dancerName, status]) => {
      this.dancers[dancerName].setFiberStatus(status);
    });
  }

  updateDancerLED(currentLedEffect) {
    if (Object.entries(currentLedEffect).length === 0)
      throw new Error(
        `[Error] updateDancersLED, invalid parameter(currentLedEffect)`
      );
    Object.entries(currentLedEffect).forEach(([dancerName, status]) => {
      this.dancers[dancerName].setLEDStatus(status);
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
    if (this.isInitialized()) {
      this.update(this.clock?.getDelta());
      Object.values(this.dancers).forEach((dancer) => {
        const { nameTag } = dancer;
        nameTag.lookAt(this.camera.position);
      });
    }

    this.composer?.render();
    requestAnimationFrame(() => this.animate());
  }

  // render current scene and dancers
  render() {
    this.composer?.render(this.scene, this.camera);
  }
}

export default ThreeController;

export const threeController = new ThreeController();
