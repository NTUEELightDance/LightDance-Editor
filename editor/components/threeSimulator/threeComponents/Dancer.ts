import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class ThreeDancer {
  scene: THREE.Scene;
  name: string;

  initialized: boolean;

  constructor(scene: THREE.Scene, name: string) {
    this.scene = scene;
    this.model = null;
    this.skeleton = null;
    this.mixer = null;
    this.name = name;
    this.parts = {};
    this.initialized = false;
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

      const hairMesh = this.model.getObjectByName("Hair");
      hairMesh.material.color.setHex(0x000000);
      hairMesh.material.emissive.setHex(0xcc00ff);
      hairMesh.material.emissiveIntensity = 0.0;
      this.parts.S_HAT = hairMesh;

      const bodyMesh = this.model.getObjectByName("Body");
      bodyMesh.material.color.setHex(0x000000);
      bodyMesh.material.emissive.setHex(0x004cff);
      bodyMesh.material.emissiveIntensity = 0.0;
      this.parts.S_L_HAND = bodyMesh;

      const bottomsMesh = this.model.getObjectByName("Bottoms");
      bottomsMesh.material.color.setHex(0x000000);
      bottomsMesh.material.emissive.setHex(0x004cff);
      bottomsMesh.material.emissiveIntensity = 0.0;
      this.parts.S_R_PANT = bottomsMesh;

      const shoesMesh = this.model.getObjectByName("Shoes");
      shoesMesh.material.color.setHex(0x000000);
      shoesMesh.material.emissive.setHex(0xff0000);
      shoesMesh.material.emissiveIntensity = 0.0;
      this.parts.S_L_SHOE = shoesMesh;

      const topsMesh = this.model.getObjectByName("Tops");
      topsMesh.material.color.setHex(0x000000);
      topsMesh.material.emissive.setHex(0x8000ff);
      topsMesh.material.emissiveIntensity = 0.0;
      this.parts.S_L_COAT = topsMesh;

      this.skeleton = new THREE.SkeletonHelper(this.model);
      this.skeleton.visible = false;

      this.scene.add(this.model);
      this.scene.add(this.skeleton);
      this.model.position.setX(position.x);
      this.model.position.setY(position.y);
      this.model.position.setZ(position.z);
      this.initialized = true;
    };
    loader.load("/asset/models/remy_with_sword.glb", initModel.bind(this));
  }

  // Update the model's positon and status
  update(currentPos, currentStatus) {
    this.updatePos(currentPos);
    this.updateStatus(currentStatus);
  }

  // Update the model's positon
  updatePos(currentPos) {
    this.model.position.setX(currentPos.x / 35);
    this.model.position.setY(0);
    this.model.position.setZ(currentPos.z / 35);
  }

  // Update the model's status
  updateStatus(currentStatus) {
    Object.entries(this.parts).forEach(([name, e]) => {
      e.material.emissiveIntensity = currentStatus[name];
    });
  }

  // Update the model's color
  updateColor(color) {
    Object.values(this.parts).forEach(([name, e]) => {
      e.material.color.setHex(color);
    });
  }
}

export default ThreeDancer;
