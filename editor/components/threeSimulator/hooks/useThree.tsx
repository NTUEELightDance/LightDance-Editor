import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const fov = 75;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 100;

const useThree = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 10);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.target.set(0, 1, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 3);
  scene.add(light);
  const clock = new THREE.Clock();

  let _canvas = null;
  /**
   * @param canvas domnode to mount
   * @param {Array} shape [width, height]
   * @param {Object} cameraPos
   */
  const init = (canvas, [width, height]) => {
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    _canvas = canvas;
    _canvas.appendChild(renderer.domElement);
  };

  const animate = (animation) => {
    animation(clock.getDelta());
    renderer.render(scene, camera);
    requestAnimationFrame(() => animate(animation));
  };

  const addObject = (object) => scene.add(object);

  const cleanUp = (canvas) => {
    canvas.removeChild(renderer.domElement);
  };

  return { init, animate, addObject, scene, cleanUp };
};

export default useThree;
