import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import MAPPING from "./mapping";

class YellowDancer {
  scene: THREE.Scene;
  name: string;

  initialized: boolean;

  constructor(scene: THREE.Scene, name: string) {
    this.scene = scene;
    this.model = null;
    this.skeleton = null;
    this.mixer = null;
    this.name = name;
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
    const loader = new GLTFLoader();

    // Intilization procedures after the model is successfully loaded.
    // 1. Add model to the scene.
    // 2. Select desired part of mesh to display light status.
    // 3. Set color of selected meshes to black and set their emissive color.
    // 4. Set alpha(emissiveIntensity) of selected meshes to 0.
    // 5. Set the position of the model to given position
    // 6. Signal this dancer is successfully initialized.

    const initModel = (gltf) => {
      this.model = gltf.scene;
      console.log(this.model);
      console.log(MAPPING);

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

      this.scene.add(this.model);
      // this.scene.add(this.skeleton);
      this.initialized = true;
    };
    loader.load("/asset/models/yellow_clean.glb", initModel.bind(this));
  }

  // Update the model's positon and status
  update(currentPos, currentStatus) {
    this.updatePos(currentPos);
    this.updateStatus(currentStatus);
  }

  // Update the model's positon
  updatePos(currentPos) {
    this.model.position.set(currentPos.x, currentPos.y, currentPos.z);
    if (this.nameTag) {
      this.nameTag.position.set(currentPos.x, currentPos.y + 8, currentPos.z);
    }
    if (this.controlBox) {
      this.controlBox.position.set(
        currentPos.x,
        currentPos.y + 4,
        currentPos.z
      );
    }
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

export default YellowDancer;
