import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class ThreeDancer {
  constructor(scene) {
    this.scene = scene;
    this.model = null;
    this.skeleton = null;
    this.mixer = null;
  }

  updatePos(currentPos) {
    this.model.position.setX(currentPos.x);
    this.model.position.setY(currentPos.y);
    this.model.position.setZ(currentPos.z);
  }

  addModel2Scene(position) {
    const loader = new GLTFLoader();
    const initModel = (gltf) => {
      this.model = gltf.scene;

      const hairMeshes = this.model.getObjectByName("Hair");
      hairMeshes.material.map = new THREE.TextureLoader().load(
        "data/models/Remy_Top_Diffuse.png"
      );

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
}

export default ThreeDancer;
