import { EventDispatcher, Raycaster, Vector2, Group } from "three";

const _raycaster = new Raycaster();
const _pointer = new Vector2();
const _group = new Group();

class SelectControls extends EventDispatcher {
  constructor(_objects, _camera, _domElement, _dragControls, _dancers, _scene) {
    super();

    _domElement.style.touchAction = "none"; // disable touch scroll

    let _selected = null;

    const _intersections = [];

    _scene.add(_group);

    //

    const scope = this;

    function activate() {
      _domElement.addEventListener("pointerdown", onPointerDown);
    }

    function deactivate() {
      _domElement.removeEventListener("pointerdown", onPointerDown);

      _domElement.style.cursor = "";
    }

    function dispose() {
      deactivate();
    }

    function getObjects() {
      return _objects;
    }

    function getGroup() {
      return _group;
    }

    function getRaycaster() {
      return _raycaster;
    }

    function onPointerDown(event) {
      if (event.button !== 0 || scope.enabled === false) return;

      updatePointer(event);

      _intersections.length = 0;

      _raycaster.setFromCamera(_pointer, _camera);
      _raycaster.intersectObjects(_objects, true, _intersections);

      const draggableObjects = _dragControls.getObjects();
      draggableObjects.length = 0;

      if (_intersections.length > 0) {
        const object = _intersections[0].object.parent;

        // Multi Selection Mode
        if (event.ctrlKey || event.metaKey) {
          // Toggle Selection
          if (_group.children.includes(object) === true) {
            removeFromGroup(object);
          } else {
            addToGroup(object);
          }
        }
        // Single Selection Mode
        else {
          clearGroup();
          addToGroup(object);
        }
      } else {
        clearGroup();
      }

      if (_group.children.length) {
        _dragControls.transformGroup = true;
        draggableObjects.push(_group);
        _selected = _group.children.map((child) => child.name);
      } else {
        _dragControls.transformGroup = false;
        draggableObjects.push(..._objects);
      }
    }

    function clearGroup() {
      while (_group.children.length) {
        const object = _group.children[0];
        const { name } = object;
        _dancers[name].unselect();
        _scene.attach(object);
      }
    }

    function addToGroup(object) {
      const { name } = object;
      _dancers[name].select();
      _group.attach(object);
    }

    function removeFromGroup() {
      const { name } = object;
      _dancers[name].unselect();
      _scene.attach(object);
    }

    function updatePointer(event) {
      const rect = _domElement.getBoundingClientRect();

      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    activate();

    // API

    this.enabled = true;
    this.enableMultiSelection = false;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;
    this.getObjects = getObjects;
    this.getGroup = getGroup;
    this.getRaycaster = getRaycaster;
  }
}

export { SelectControls };
