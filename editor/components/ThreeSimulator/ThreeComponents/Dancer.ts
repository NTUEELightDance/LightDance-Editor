import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { state } from "core/state";

import { LEDPart, FiberPart } from "./Part";
import {
  Coordinates,
  DancerStatus,
  FiberData,
  LEDPartName,
  LEDPartStatus,
  isFiberData,
} from "@/core/models";
import { Group } from "three";

// import ALL_MAPPING from "./mapping";
interface MeshType extends THREE.Mesh {
  //material: THREE.MeshStandardMaterial;
  material: THREE.MeshBasicMaterial;
}

class Dancer {
  scene: THREE.Scene;
  name: string;
  nameTag: MeshType;
  modelSrc: string;
  initialized: boolean;
  manager: THREE.LoadingManager;

  model: THREE.Object3D;
  skeleton: THREE.Skeleton | null;
  parts: {
    LED: Record<string, LEDPart>;
    FIBER: Record<string, FiberPart>;
  };

  initStatus: DancerStatus;
  initPos: Coordinates;

  constructor(
    scene: THREE.Scene,
    name: string,
    modelSrc: string,
    manager: THREE.LoadingManager
  ) {
    this.scene = scene;
    this.name = name;
    this.nameTag = new THREE.Mesh();
    this.modelSrc = modelSrc;
    this.manager = manager;

    this.model = new Group();
    this.skeleton = null;
    this.parts = {
      LED: {},
      FIBER: {},
    };
    this.initStatus = {};
    this.initPos = { x: 0, y: 0, z: 0 };
    this.initialized = false;
  }

  // Load model with given URL and capture all the meshes for light status
  addModel2Scene(currentStatus: DancerStatus, currentPos: Coordinates) {
    this.initStatus = currentStatus;
    this.initPos = currentPos;

    // Use GLTF loader to load target model from URL
    const modelLoader = new GLTFLoader(this.manager);

    //  Use DRACOLoader if available
    if (this.modelSrc.includes("draco")) {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/asset/libs/draco/");
      dracoLoader.preload();
      modelLoader.setDRACOLoader(dracoLoader);
    }

    modelLoader.load(this.modelSrc, this.initModel.bind(this));

    // Use fontLoader to load font and create nameTag
    const fontLoader = new FontLoader();
    fontLoader.load(
      "asset/fonts/helvetiker_regular.typeface.json",
      this.initNameTag.bind(this)
    );
  }

  // Initialization procedures after the model is successfully loaded.
  // 1. Add model to the scene.
  // 2. Select desired part of mesh to display light status.
  // 3. Set color of selected meshes to black and set their emissive color.
  // 4. Set alpha(emissiveIntensity) of selected meshes to 0.
  // 5. Set the position of the model to given position
  // 6. Signal this dancer is successfully initialized.
  initModel(gltf: GLTF) {
    const { name } = this;
    this.model = gltf.scene;
    this.model.name = name;

    const partMapping: Record<string, string> = {};
    this.model.children.forEach(
      (child) =>
        (partMapping[child.name as keyof typeof partMapping] = child.name)
    );
    const partNames = state.dancers[this.name];

    partNames.forEach((partName) => {
      const partType = state.partTypeMap[partName];
      switch (partType) {
        case "LED":
          this.parts.LED[partName] = new LEDPart(partName, this.model);
          this.model.add(this.parts.LED[partName].LEDs);
          break;
        case "FIBER":
          this.parts.FIBER[partName] = new FiberPart(partName, this.model);
          break;
      }
    });

    // this.skeleton = new THREE.SkeletonHelper(this.model);
    // this.skeleton.visible = false;

    this.model.scale.set(1.3, 1.3, 1.3);

    this.scene.attach(this.model);
    this.model.matrixAutoUpdate = false;
    // this.scene.add(this.skeleton);

    // attach nameTag to the model
    this.model.attach(this.nameTag);

    this.setFiberStatus(this.initStatus);
    this.setPos(this.initPos);

    this.initialized = true;

    //dancer initialization
    this.unhover();
  }

  // Create nameTag given font
  initNameTag(font: Font) {
    const color = 0xffffff;

    const matLite = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    const message = this.name;
    const shapes = font.generateShapes(message, 0.3);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    const xMid = geometry.boundingBox
      ? -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
      : 0;
    geometry.translate(xMid, 0, 0);

    // make shape ( N.B. edge view not visible )
    const text = new THREE.Mesh(geometry, matLite);
    text.position.set(0, 8, 0);

    text.name = "nameTag";

    this.nameTag = text;
  }

  updateSelected(selected: boolean) {
    if (selected) {
      this.nameTag.material.color.setRGB(0.21, 0.64, 1);
    } else {
      this.nameTag.material.color.setRGB(1, 1, 1);
    }
  }

  // Update the model's position
  setPos(currentPos: Coordinates) {
    const newPos = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
    const oldPos = new THREE.Vector3().setFromMatrixPosition(this.model.matrix);

    if (!newPos.equals(oldPos)) {
      this.model.matrix.setPosition(currentPos.x, currentPos.y, currentPos.z);
    }
  }

  setFiberStatus(currentStatus: DancerStatus) {
    Object.entries(this.parts.FIBER).forEach(([partName, part]) => {
      //type of part is FiberData
      if (!isFiberData(currentStatus[partName])) return;
      part.setStatus(currentStatus[partName] as FiberData);
    });
  }

  setLEDStatus(currentLEDStatus: LEDPartStatus) {
    Object.entries(this.parts.LED).forEach(([partName, part]) => {
      part.setStatus(currentLEDStatus[partName as LEDPartName]);
    });
  }

  setSelectedLEDParts(selectedLEDParts: Iterable<string>) {
    const selectedLEDPartsSet = new Set(selectedLEDParts);
    Object.entries(this.parts.LED).forEach(([partName, part]) => {
      if (selectedLEDPartsSet.has(partName)) {
        part.select();
      } else {
        part.deselect();
      }
    });
  }

  hover() {
    this.getHumanMesh().material.color.setHex(0xaaaaaa);
  }

  unhover() {
    this.getHumanMesh().material.color.setHex(0x000000);
  }

  getHumanMesh() {
    return this.model.getObjectByName("Human") as MeshType;
  }
}

export default Dancer;
