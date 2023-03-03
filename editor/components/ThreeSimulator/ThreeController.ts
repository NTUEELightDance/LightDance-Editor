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
import type {
  ControlMapStatus,
  CurrentLEDStatus,
  PosMapStatus,
  Selected,
  State,
} from "@/core/models";
import { getDancerFromLEDpart } from "@/core/utils";
import { LEDPartName } from "@/core/models";

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

  state: null | State;
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
    this.generateCenterMarker();
    this.manager = this.generateLoadManager();
    this.dancers = {};
    this.controls = new Controls(
      this.renderer,
      this.scene,
      this.camera,
      this.dancers
    );

    // Data and status for playback
    this.state = null;
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
    //this.renderer = this.generateRenderer();

    // Postprocessing for anti-aliasing effect
    this.composer = this.generateComposer();

    // Add Setting to container
    this.settings = new Settings(this);

    // Append the canvas to given ref
    this.canvas.appendChild(this.renderer.domElement);

    // Initialization of all dancers with currentPos
    this.initDancers();

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
    selectedOutline.edgeStrength = 5.0;
    selectedOutline.edgeThickness = 0.2;
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
    const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      samples: 4,
    });

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
    const gridHelper = new GridHelper(60, 30, 20, 10); // (horizontalLength, verticalLength, horizontalDivisions, verticalDivisions)
    gridHelper.matrixAutoUpdate = false;
    this.scene.add(gridHelper);
    return gridHelper;
  }

  // Add a center marker in the middle
  generateCenterMarker() {
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

  clearSelectedLEDs() {
    Object.entries(this.dancers).forEach(([dancerName, dancerData]) => {
      Object.entries(dancerData.parts.LED).forEach(([ledPart, ledData]) => {
        ledData.selectedLEDs = [];
      });
    });
  }

  updateSelectedLEDs(selectedLED: number[], selectedLEDPart: string) {
    const dancerName = getDancerFromLEDpart(selectedLEDPart as LEDPartName);
    if (dancerName === undefined) {
      return;
    }
    console.log(dancerName);
    this.clearSelectedLEDs();
    if (selectedLED.length > 0) {
      this.dancers[dancerName].parts.LED[selectedLEDPart].selectedLEDs =
        selectedLED;
    }
  }

  zoomInSelectedLED(selectedLEDPart: { dancer: string; part: string }) {
    console.log(this.dancers);
    console.log(selectedLEDPart.dancer);
    const pos = [];
    let posx = 0;
    let posy = 0;
    let posz = 0;
    const LEDPart =
      this.dancers[selectedLEDPart.dancer].parts.LED[selectedLEDPart.part];
    for (let i = 0; i < LEDPart.model.children.length; i++) {
      if (LEDPart.model.children[i].name.includes(selectedLEDPart.part)) {
        pos.push(LEDPart.model.children[i].position);
        posx += LEDPart.model.children[i].position.x;
        posy += LEDPart.model.children[i].position.y;
        posz += LEDPart.model.children[i].position.z;
      }
    }

    posx /= pos.length;
    posy /= pos.length;
    posz /= pos.length;
    const addx =
      this.dancers[selectedLEDPart.dancer].model.position.x === 0
        ? this.dancers[selectedLEDPart.dancer].initPos.x
        : this.dancers[selectedLEDPart.dancer].model.position.x;
    const addy =
      this.dancers[selectedLEDPart.dancer].model.position.y === 0
        ? this.dancers[selectedLEDPart.dancer].initPos.y
        : this.dancers[selectedLEDPart.dancer].model.position.y;
    if (pos.length > 0) {
      this.camera.position.set(
        posx + addx,
        1.2 * posy + addy,
        posz + LEDPart.model.position.z + 5
      );
      this.camera.rotation.set(0, 0, 0);

      this.camera.lookAt(posx + addx, posy + addy, -30);
      this.controls.orbitControls.target.x = posx + addx;
      this.controls.orbitControls.target.y = posy + addy;
      this.controls.orbitControls.target.z = -30;
    }
  }

  // calculate and set next frame status according to time and call updateDancers
  update() {
    this.updateDancersStatus(state.currentStatus);
    this.updateDancerLED(state.currentLEDStatus);

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

  updateDancerLED(currentLEDStatus: CurrentLEDStatus) {
    if (Object.entries(currentLEDStatus).length === 0) {
      throw new Error(
        `[Error] updateDancersLED, invalid parameter(currentLEDStatus: ${currentLEDStatus})`
      );
    }
    if (!this.settings.config.Visibility.LED) return;
    Object.entries(currentLEDStatus).forEach(([dancerName, status]) => {
      this.dancers[dancerName].setLEDStatus(status);
    });
  }

  updateDancersPos(currentPos: PosMapStatus) {
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

    this.composer.render();
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
