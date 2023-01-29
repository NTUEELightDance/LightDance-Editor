import * as THREE from "three";

const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.2;
const far = 100;

class Camera {
  width : number;
  height : number;
  camera : THREE.PerspectiveCamera;

  constructor(width, height) {
    this.width = width;
    this.height = height;

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
}

export default Camera;
