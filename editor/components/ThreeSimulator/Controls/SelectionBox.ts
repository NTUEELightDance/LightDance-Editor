import {
  Frustum,
  Vector3,
  Matrix4,
  Quaternion,
  type PerspectiveCamera,
  type Scene,
  Mesh,
  Line,
  Points,
  InstancedMesh,
  Object3D,
} from "three";

/**
 * This is a class to check whether objects are in a selection area in 3D space
 */

const _frustum = new Frustum();
const _center = new Vector3();

const _tmpPoint = new Vector3();

const _vecNear = new Vector3();
const _vecTopLeft = new Vector3();
const _vecTopRight = new Vector3();
const _vecDownRight = new Vector3();
const _vecDownLeft = new Vector3();

const _vectemp1 = new Vector3();
const _vectemp2 = new Vector3();
const _vectemp3 = new Vector3();

const _matrix = new Matrix4();
const _quaternion = new Quaternion();
const _scale = new Vector3();

type FrustumObject = Mesh | Line | Points | InstancedMesh;
class SelectionBox {
  camera: PerspectiveCamera;
  scene: Scene;
  startPoint: Vector3;
  endPoint: Vector3;
  collection: Array<Mesh | Line | Points | InstancedMesh>;
  instances: { [uuid: string]: number[] };
  deep: number;

  constructor(
    camera: PerspectiveCamera,
    scene: Scene,
    deep = Number.MAX_VALUE
  ) {
    this.camera = camera;
    this.scene = scene;
    this.startPoint = new Vector3();
    this.endPoint = new Vector3();
    this.collection = [];
    this.instances = {};
    this.deep = deep;
  }

  select() {
    this.collection = [];

    this.updateFrustum(this.startPoint, this.endPoint);
    this.searchChildInFrustum(_frustum, this.scene);

    return this.collection;
  }

  updateFrustum(startPoint: Vector3, endPoint: Vector3) {
    startPoint = startPoint || this.startPoint;
    endPoint = endPoint || this.endPoint;

    // Avoid invalid frustum

    if (startPoint.x === endPoint.x) {
      endPoint.x += Number.EPSILON;
    }

    if (startPoint.y === endPoint.y) {
      endPoint.y += Number.EPSILON;
    }

    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    if (this.camera.isPerspectiveCamera) {
      _tmpPoint.copy(startPoint);
      _tmpPoint.x = Math.min(startPoint.x, endPoint.x);
      _tmpPoint.y = Math.max(startPoint.y, endPoint.y);
      endPoint.x = Math.max(startPoint.x, endPoint.x);
      endPoint.y = Math.min(startPoint.y, endPoint.y);

      _vecNear.setFromMatrixPosition(this.camera.matrixWorld);
      _vecTopLeft.copy(_tmpPoint);
      _vecTopRight.set(endPoint.x, _tmpPoint.y, 0);
      _vecDownRight.copy(endPoint);
      _vecDownLeft.set(_tmpPoint.x, endPoint.y, 0);

      _vecTopLeft.unproject(this.camera);
      _vecTopRight.unproject(this.camera);
      _vecDownRight.unproject(this.camera);
      _vecDownLeft.unproject(this.camera);

      _vectemp1.copy(_vecTopLeft).sub(_vecNear);
      _vectemp2.copy(_vecTopRight).sub(_vecNear);
      _vectemp3.copy(_vecDownRight).sub(_vecNear);
      _vectemp1.normalize();
      _vectemp2.normalize();
      _vectemp3.normalize();

      _vectemp1.multiplyScalar(this.deep);
      _vectemp2.multiplyScalar(this.deep);
      _vectemp3.multiplyScalar(this.deep);
      _vectemp1.add(_vecNear);
      _vectemp2.add(_vecNear);
      _vectemp3.add(_vecNear);

      const planes = _frustum.planes;

      planes[0].setFromCoplanarPoints(_vecNear, _vecTopLeft, _vecTopRight);
      planes[1].setFromCoplanarPoints(_vecNear, _vecTopRight, _vecDownRight);
      planes[2].setFromCoplanarPoints(_vecDownRight, _vecDownLeft, _vecNear);
      planes[3].setFromCoplanarPoints(_vecDownLeft, _vecTopLeft, _vecNear);
      planes[4].setFromCoplanarPoints(
        _vecTopRight,
        _vecDownRight,
        _vecDownLeft
      );
      planes[5].setFromCoplanarPoints(_vectemp3, _vectemp2, _vectemp1);
      planes[5].normal.multiplyScalar(-1);
    } else {
      console.error("THREE.SelectionBox: Unsupported camera type.");
    }
  }

  searchChildInFrustumScene(frustum: Frustum, scene: Scene) {
    if (scene.children.length > 0) {
      for (let x = 0; x < scene.children.length; x++) {
        this.searchChildInFrustum(frustum, scene.children[x] as FrustumObject);
      }
    }
  }

  searchChildInFrustum(frustum: Frustum, object: FrustumObject | Object3D) {
    if (
      (object as Mesh).isMesh ||
      (object as Line).isLine ||
      (object as Points).isPoints
    ) {
      if ((object as InstancedMesh).isInstancedMesh) {
        this.instances[object.uuid] = [];

        for (
          let instanceId = 0;
          instanceId < (object as InstancedMesh).count;
          instanceId++
        ) {
          (object as InstancedMesh).getMatrixAt(instanceId, _matrix);
          _matrix.decompose(_center, _quaternion, _scale);
          _center.applyMatrix4(object.matrixWorld);

          if (frustum.containsPoint(_center)) {
            this.instances[object.uuid].push(instanceId);
          }
        }
      } else {
        if ((object as FrustumObject).geometry.boundingSphere === null)
          (object as FrustumObject).geometry.computeBoundingSphere();

        _center.copy((object as FrustumObject).geometry.boundingSphere!.center);

        _center.applyMatrix4((object as FrustumObject).matrixWorld);

        if (frustum.containsPoint(_center)) {
          this.collection.push(object as FrustumObject);
        }
      }
    }

    if (object.children.length > 0) {
      for (let x = 0; x < object.children.length; x++) {
        this.searchChildInFrustum(frustum, object.children[x] as FrustumObject);
      }
    }
  }
}

export { SelectionBox };
