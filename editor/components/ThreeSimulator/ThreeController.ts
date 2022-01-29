import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
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
  orbitControls: OrbitControls | null;
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
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enablePan = true;
    orbitControls.enableZoom = true;
    // controls.screenSpacePanning = true;
    orbitControls.target.set(
      -0.7125719340319995,
      2.533987823530335,
      -0.07978443261089622
    );

    orbitControls.update();
    this.orbitControls = orbitControls;

    // Add a background scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const helper = new THREE.GridHelper(30, 10);
    scene.add(helper);

    // Add a dim light to identity each dancers
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    // directionalLight.position.set(-1, 1, 1);
    // scene.add(directionalLight);

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
    const currentPos = reactiveState.currentPos();

    this.objects = [];
    const gridPosition = new THREE.Vector3();
    gridPosition.set(0, 0, 0);
    const geometry = new THREE.BoxGeometry(1, 8, 1);
    Object.entries(currentPos).forEach(([name, position], i) => {
      if (!name.includes("sw")) {
        // if (name.includes("191")) {
        // const newDancer = new ThreeDancer(this.scene, name);
        const newDancer = new YellowDancer(this.scene, name);
        const newPos = {
          x: position.x / 30,
          y: 0,
          z: position.z / 30,
        };
        gridPosition.x += position.x;
        gridPosition.z += position.z;
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

    gridPosition.x = gridPosition.x / this.dancers.length;
    gridPosition.x = gridPosition.x / this.dancers.length;

    this.fontInit();

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

  dragControlInit() {
    this.enableSelection = false;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    // this.objects = Object.values(this.dancers).map((dancer) => dancer.model);
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.dragControls = new DragControls(
      [...this.objects],
      this.camera,
      this.renderer.domElement
    );
    this.dragControls.enabled = false;
    this.dragControls.addEventListener("drag", (event) => {
      const { name } = event.object.userData;
      const { position } = event.object;
      const newPosition = position.clone();
      newPosition.setY(newPosition.y - 4);
      this.nameTags[name].material.color.setRGB(1, 1, 1);
      this.dancers[name].updatePos(newPosition);
      this.render();
    });
    this.dragControls.addEventListener("dragend", (event) => {
      const { name } = event.object.userData;
      this.nameTags[name].material.color.setRGB(0, 0.4, 0.6);
      this.render();
      // this.dragControls.enabled = false;
      this.dragControls.enabled = false;
      this.orbitControls.enabled = true;
    });

    addEventListener("click", this.onClick.bind(this));
    addEventListener("keydown", this.onKeyDown.bind(this));
    addEventListener("keyup", this.onKeyUp.bind(this));
  }

  onKeyDown(event) {
    // hold ctrl to enable grouping
    if (event.keyCode === 16) {
      this.enableSelection = true;
      console.log("groupControl enabled");
    }
    // press v to enable moving
    if (event.keyCode === 86) {
      this.dragControls.enabled = true;
      this.orbitControls.enabled = false;

      // this.objects.forEach((o) => {
      //   const { name } = o.userData;
      //   const { position } = this.dancers[name].model;
      //   o.position.set(position.x, 0, position.z);
      // });
      console.log(`dragControls ${this.dragControls.enabled}`);
    }
  }

  onKeyUp(event) {
    if (event.keyCode === 16) {
      this.enableSelection = false;
      console.log("groupControl disabled");
    }
    if (event.keyCode === 86) {
      this.dragControls.enabled = false;
      this.orbitControls.enabled = true;
    }
  }

  onClick(event) {
    event.preventDefault();
    console.log(`onClick: ${this.enableSelection}`);

    if (this.enableSelection === true) {
      const draggableObjects = this.dragControls.getObjects();
      draggableObjects.length = 0;

      const rect = this.renderer.domElement.getBoundingClientRect();

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersections = this.raycaster.intersectObjects(this.objects, true);
      console.log(intersections);

      if (intersections.length > 0) {
        const object = intersections[0].object;

        if (this.group.children.includes(object) === true) {
          object.material.emissive.set(0x000000);
          this.scene.attach(object);
        } else {
          object.material.emissive.set(0xaaaaaa);
          this.group.attach(object);
        }

        this.dragControls.transformGroup = true;
        draggableObjects.push(this.group);
      }

      if (this.group.children.length === 0) {
        this.dragControls.transformGroup = false;
        draggableObjects.push(...this.objects);
      }
    }
    this.render();
  }

  fontInit() {
    const loader = new FontLoader();
    loader.load(
      "asset/fonts/helvetiker_regular.typeface.json",
      this.fontLoader.bind(this)
    ); //end load function
  }

  fontLoader(font) {
    const color = 0x006699;

    this.nameTags = {};
    const { currentPos } = store.getState().global;
    Object.entries(currentPos).forEach(([name, position], i) => {
      if (!name.includes("sw")) {
        const matLite = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        });

        const matDark = new THREE.LineBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
        });

        const message = name;

        const shapes = font.generateShapes(message, 0.3);

        const geometry = new THREE.ShapeGeometry(shapes);

        geometry.computeBoundingBox();

        const xMid =
          -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

        geometry.translate(xMid, 0, 0);

        // make shape ( N.B. edge view not visible )

        const text = new THREE.Mesh(geometry, matLite);
        // text.position.z = -150;
        text.position.set(position.x / 30, 8, position.z / 30);
        this.nameTags[name] = text;
        this.dancers[name].nameTag = text;
        this.scene.add(text);

        // make line shape ( N.B. edge view remains visible )

        // const holeShapes = [];

        // for (let i = 0; i < shapes.length; i++) {
        //   const shape = shapes[i];

        //   if (shape.holes && shape.holes.length > 0) {
        //     for (let j = 0; j < shape.holes.length; j++) {
        //       const hole = shape.holes[j];
        //       holeShapes.push(hole);
        //     }
        //   }
        // }

        // shapes.push.apply(shapes, holeShapes);

        // const lineText = new THREE.Object3D();

        // for (let i = 0; i < shapes.length; i++) {
        //   const shape = shapes[i];

        //   const points = shape.getPoints();
        //   const geometry = new THREE.BufferGeometry().setFromPoints(points);

        //   geometry.translate(xMid, 0, 0);

        //   const lineMesh = new THREE.Line(geometry, matDark);
        //   lineText.add(lineMesh);
        // }
        // // lineText.position.set(position.x, 5, position.z);
        // this.scene.add(lineText);
      }
    });
    this.render();
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
      state.currentPos = state.posRecord[newPosFrame].pos;
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
    if (this.nameTags) {
      Object.values(this.nameTags).forEach((text) => {
        text.lookAt(this.camera.position);
      });
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

export const threeController = new ThreeController();
