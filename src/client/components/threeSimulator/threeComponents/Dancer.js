import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let MODEL = null;

class ThreeDancer {
  constructor(scene, name) {
    this.scene = scene;
    this.model = null;
    this.skeleton = null;
    this.mixer = null;
    this.name = name;
    this.parts = {};
  }

  addModel2Scene(position) {
    const loader = new GLTFLoader();
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
    };
    loader.load("data/models/remy.gltf", initModel.bind(this));
  }

  update(currentPos, currentStatus) {
    this.updatePos(currentPos);
    this.updateStatus(currentStatus);
  }

  updatePos(currentPos) {
    this.model.position.setX(currentPos.x / 35);
    this.model.position.setY(0);
    this.model.position.setZ(currentPos.z / 35);
  }

  updateStatus(currentStatus) {
    Object.entries(this.parts).forEach(([name, e]) => {
      e.material.emissiveIntensity = currentStatus[name];
    });
  }

  updateColor(color) {
    Object.values(this.parts).forEach(([name, e]) => {
      e.material.color.setHex(color);
    });
  }
}

export default ThreeDancer;
