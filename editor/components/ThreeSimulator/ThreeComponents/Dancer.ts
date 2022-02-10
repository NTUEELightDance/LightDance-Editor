import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

import MAPPING from "./mapping";

class Dancer {
  scene: THREE.Scene;
  name: string;
  modelSrc: string;

  initialized: boolean;

  constructor(scene: THREE.Scene, name: string, modelSrc: string) {
    this.scene = scene;
    this.name = name;
    this.modelSrc = modelSrc;
    this.model = null;
    this.skeleton = null;
    this.mixer = null;
    this.OFParts = {};
    this.initialized = false;
    this.color = {
      r: 1,
      g: 1,
      b: 0.17821459099650383,
    };
  }

  // Load model with given URL and capture all the meshes for light status
  addModel2Scene(position) {
    // Use GLTF loader to load target model from URL
    this.initPosition = position;
    const modelLoader = new GLTFLoader();
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
    const position = this.initPosition;
    const partMapping = {};
    this.model.children.forEach(
      (child) => (partMapping[child.name] = child.name)
    );
    console.log(JSON.stringify(partMapping));

    this.model.traverse((part) => {
      const { name, type } = part;
      // clone a new material to prevent shared material
      if (type === "Mesh") {
        part.material = part.material.clone();
        part.material.color.setHex(0x000000);
        part.material.emissiveIntensity = 0.0;
        if (!name.includes("LED") && !(name === "human")) {
          // part.material.color.setHex(0x000000);
          // part.material.emissiveIntensity = 0.0;
          this.OFParts[name] = part;
        }
      }
    });

    const human = this.model.getObjectByName("human");
    human.material.color.setHex(0x000000);
    human.material.emissive.setHex(0x000000);
    human.material.emissiveIntensity = 0.0;

    // this.skeleton = new THREE.SkeletonHelper(this.model);
    // this.skeleton.visible = false;

    this.model.position.setX(position.x);
    this.model.position.setY(position.y);
    this.model.position.setZ(position.z);
    this.model.scale.set(1.3, 1.3, 1.3);

    this.scene.attach(this.model);
    // this.scene.add(this.skeleton);

    // attach nameTag to the model
    this.model.attach(this.nameTag);
    this.initialized = true;
  }

  // Create nameTag given font
  initNameTag(font) {
    const position = this.initPosition;
    const color = 0x006699;

    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
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
    text.position.set(position.x, 8, position.z);

    this.nameTag = text;
  }

  select() {
    this.selected = true;
    this.nameTag.material.color.setRGB(1, 1, 1);
  }

  unselect() {
    this.selected = false;
    this.nameTag.material.color.setRGB(0, 0.4, 0.6);
  }

  // Update the model's positon and status
  update(currentPos, currentStatus) {
    this.updatePos(currentPos);
    this.updateStatus(currentStatus);
  }

  // Update the model's positon
  updatePos(currentPos) {
    this.model.position.set(currentPos.x, currentPos.y, currentPos.z);
  }

  // Update the model's status
  updateStatus(currentStatus) {
    Object.entries(this.OFParts).forEach(([name, e]) => {
      let intensity = 0.0;
      Object.values(MAPPING).forEach((MAP) => {
        if (currentStatus[MAP[name]]) {
          intensity += currentStatus[MAP[name]];
          if (intensity == 1) this.color = MAP.color;
        }
      });
      e.material.emissive.setRGB(this.color.r, this.color.g, this.color.b);
      e.material.emissiveIntensity = intensity;
    });
  }

  // Update the model's color
  updateColor(color) {
    Object.values(this.OFParts).forEach(([name, e]) => {
      e.material.color.setHex(color);
    });
  }
}

export default Dancer;
