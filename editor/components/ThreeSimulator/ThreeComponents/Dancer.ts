import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { state } from "core/state";

import { FIBER, EL, LED } from "constants";

// import ALL_MAPPING from "./mapping";

class Dancer {
  scene: THREE.Scene;
  name: string;
  modelSrc: string;
  initialized: boolean;

  constructor(scene: THREE.Scene, name: string, modelSrc: string, manager) {
    this.scene = scene;
    this.name = name;
    this.modelSrc = modelSrc;
    this.model = null;
    this.skeleton = null;
    this.mixer = null;
    this.parts = {
      [EL]: {},
      [LED]: {},
      [FIBER]: {},
    };
    this.initialized = false;
    this.manager = manager;
  }

  // Load model with given URL and capture all the meshes for light status
  addModel2Scene(currentStatus, currentPos) {
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

  // Intilization procedures after the model is successfully loaded.
  // 1. Add model to the scene.
  // 2. Select desired part of mesh to display light status.
  // 3. Set color of selected meshes to black and set their emissive color.
  // 4. Set alpha(emissiveIntensity) of selected meshes to 0.
  // 5. Set the position of the model to given position
  // 6. Signal this dancer is successfully initialized.
  initModel(gltf) {
    this.model = gltf.scene;
    this.model.name = this.name;
    const partMapping = {};
    this.model.children.forEach(
      (child) => (partMapping[child.name] = child.name)
    );

    // Preprocess Parts on body
    this.model.traverse((part) => {
      const { name, type } = part;

      // Deal with mesh only
      if (type === "Mesh") {
        // console.log(this.modelSrc, part.material.emissive);
        // Clone a new material to prevent shared material
        part.material = part.material.clone();

        // Set all material color to black and emissiveIntensity to 0.0
        part.material.color.setHex(0x000000);
        part.material.emissiveIntensity = 0.0;

        // Deal with human body mesh
        if (name === "Human") {
          part.material.emissive.setHex(0x000000);
        }
        // Deal with different type of meshPart
        else {
          const partType = state.partTypeMap[name];
          switch (partType) {
            case EL:
              this.parts[EL][name] = part;
              break;
            case LED:
              this.parts[LED][name] = part;
              part.visible = false;
              break;
            case FIBER:
              this.parts[FIBER][name] = part;
              break;
          }
        }
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

    this.setStatus(this.initStatus);
    this.setPos(this.initPos);

    this.initialized = true;
  }

  // Create nameTag given font
  initNameTag(font) {
    const color = 0xffffff;

    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    const message = this.name;
    const shapes = font.generateShapes(message, 0.3);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    const xMid =
      -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 0);

    // make shape ( N.B. edge view not visible )
    const text = new THREE.Mesh(geometry, matLite);
    text.position.set(0, 8, 0);

    text.name = "nameTag";

    this.nameTag = text;
  }

  updateSelected(selected) {
    if (selected) {
      this.selected = true;
      this.nameTag.material.color.setRGB(0, 0.4, 0.6);
    } else {
      this.selected = false;
      this.nameTag.material.color.setRGB(1, 1, 1);
    }
  }

  // Update the model's positon and status
  update(currentPos, currentStatus) {
    this.setPos(currentPos);
    this.setStatus(currentStatus);
  }

  // Update the model's positon
  setPos(currentPos) {
    const newPos = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
    const oldPos = new THREE.Vector3().setFromMatrixPosition(this.model.matrix);

    if (!newPos.equals(oldPos)) {
      this.model.matrix.setPosition(currentPos.x, currentPos.y, currentPos.z);
    }
  }

  // Update the model's status
  setStatus(currentStatus) {
    this.setFIBERStatus(currentStatus);
    this.setELStatus(currentStatus);
    this.setLEDStatus(currentStatus);
  }

  setFIBERStatus(currentStatus) {
    Object.entries(this.parts[FIBER]).forEach(([name, part]) => {
      const { color, alpha } = currentStatus[name];
      part.material.emissiveIntensity = alpha / 15;
      part.material.emissive.setHex(
        parseInt(state.colorMap[color].replace(/^#/, ""), 16)
      );
    });
  }

  setELStatus(currentStatus) {
    return;
  }

  setLEDStatus(currentStatus) {
    return;
  }

  // Update the model's color
  updateColor(color) {
    Object.values(this.FIBERParts).forEach(([name, e]) => {
      e.material.color.setHex(color);
    });
  }

  hover() {
    this.model.getObjectByName("Human").material.color.setHex(0x232323);
  }

  unhover() {
    this.model.getObjectByName("Human").material.color.setHex(0x000000);
  }
}

export default Dancer;
