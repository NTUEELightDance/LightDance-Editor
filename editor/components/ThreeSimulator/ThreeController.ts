import * as THREE from "three";
// three.js
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
// postprocessing for three.js

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
// three gui

import Stats from "three/examples/jsm/libs/stats.module";
// performance monitor

// components
import { Dancer } from "./ThreeComponents";
// states
import { state } from "core/state";

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
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    // directionalLight.position.set(-1, 1, 1);
    // scene.add(directionalLight);

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
    const composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    // Postprocessing for antialiasing effect
    composer.addPass(new RenderPass(this.scene, this.camera));

    const pass = new SMAAPass(
      this.width * this.renderer.getPixelRatio(),
      this.height * this.renderer.getPixelRatio()
    );
    composer.addPass(pass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        this.width * this.renderer.getPixelRatio(),
        this.height * this.renderer.getPixelRatio()
      ),
      2,
      0.4,
      0.85
    );

    bloomPass.threshold = 0.521;
    bloomPass.strength = 0.75;
    bloomPass.radius = 1;

    composer.addPass(bloomPass);

    const outline = new OutlinePass(
      new THREE.Vector2(this.width, this.height),
      this.scene,
      this.camera
    );
    composer.addPass(outline);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/asset/textures/tri_pattern.jpg", (texture) => {
      outline.patternTexture = texture;
      // outline.usePatternTexture = true;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });

    outline.edgeStrength = 2.0;
    outline.edgeThickness = 1.0;
    outline.visibleEdgeColor.set(0xffffff);
    outline.hiddenEdgeColor.set(0xffffff);

    this.outline = outline;
    this.composer = composer;
  }

  initDancers() {
    this.initLoadManager();

    const { dancerNames, currentStatus, currentPos } = state;

    dancerNames.forEach((name) => {
      let url;
      const index = Number(name.split("_")[0]);
      if (index <= 5 && index >= 0) {
        url = "/asset/models/yellow.glb";
      } else if (index >= 6 && index <= 10) {
        url = "/asset/models/cyan.glb";
      } else if (index === 11) {
        url = "/asset/models/magenta.glb";
      }

      const newDancer = new Dancer(this.scene, name, url, this.manager);
      newDancer.addModel2Scene(currentStatus[name], currentPos[name]);
      this.dancers[name] = newDancer;
    });
  }

  initGridHelper() {
    const helper = new THREE.GridHelper(30, 10);
    this.scene.add(helper);
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
  }

  initCenterMarker() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 2.5);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.setZ(12.5);
    console.log(cube);

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
    this.renderer.setSize(width, height);
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
        x: state.currentPos[dancer.name].x,
        y: state.currentPos[dancer.name].y,
        z: state.currentPos[dancer.name].z,
      };
      dancer.update(newPos, state.currentStatus[dancer.name]);
    });
  }

  updateSelected(selected) {
    if (Object.entries(selected).length === 0)
      throw new Error(
        `[Error] updateDancersStatus, invalid parameter(currentStatus)`
      );

    const selectedDancers = {};
    const selectedParts = [];

    Object.entries(selected).forEach(([key, value]) => {
      this.dancers[key].updateSelected(value.selected);
      selectedDancers[key] = value.selected;

      selectedParts.push(
        ...this.dancers[key].model.children.filter(
          (part) =>
            part.name !== "nameTag" &&
            ((part.name === "Human" && value.selected) ||
              value.parts.includes(part.name))
        )
      );
    });

    this.controls.selectControls.updateSelected(selectedDancers);
    this.outline.selectedObjects = selectedParts;
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

  play() {
    this.animateID = this.animate();
  }

  stop() {
    cancelAnimationFrame(this.animateID);
  }

  // render current scene and dancers
  render() {
    this.renderer?.render(this.scene, this.camera);
  }
}

export default ThreeController;

export const threeController = new ThreeController();
