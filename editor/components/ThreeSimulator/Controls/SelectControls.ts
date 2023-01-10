import { EventDispatcher, Raycaster, Vector2, Group } from "three";
import { setSelectedDancers, clearSelected } from "../../../core/actions";
import { DANCER, PART } from "@/constants";

import { throttle } from "throttle-debounce";

const _raycaster = new Raycaster();
const _pointer = new Vector2();
const _group = new Group();

class SelectControls extends EventDispatcher {
  constructor (_objects, _camera, _domElement, _dragControls, _dancers, _scene) {
    super();

    _domElement.style.touchAction = "none"; // disable touch scroll

    let _selected = null;
    let _mode = DANCER;

    const _intersections = [];

    _scene.add(_group);

    //

    const scope = this;

    function activate (mode) {
      _domElement.addEventListener("pointerdown", onPointerDown);
      _domElement.addEventListener(
        "pointermove",
        throttle(1000 / 30, onPointerMove)
      );

      _mode = mode;
    }

    function deactivate () {
      _domElement.removeEventListener("pointerdown", onPointerDown);
      _domElement.removeEventListener(
        "pointermove",
        throttle(1000 / 30, onPointerMove)
      );

      _domElement.style.cursor = "";
    }

    function dispose () {
      deactivate();
    }

    function getObjects () {
      return _objects;
    }

    function getGroup () {
      return _group;
    }

    function getRaycaster () {
      return _raycaster;
    }

    function onPointerDown (event) {
      if (event.button !== 0 || scope.enabled === false) return;

      updatePointer(event);

      _intersections.length = 0;

      _raycaster.setFromCamera(_pointer, _camera);
      _raycaster.intersectObjects(_objects, true, _intersections);

      if (_intersections.length > 0) {
        const object = _intersections[0].object.parent;

        // Multi Selection Mode
        if (event.ctrlKey || event.metaKey) {
          // Toggle Selection
          if (_group.children.includes(object)) {
            _removeFromGroup(object);
          } else {
            _addToGroup(object);
          }
        }
        // Single Selection Mode
        else {
          if (!_group.children.includes(object)) {
            _clearGroup();
            _addToGroup(object);
          }
        }
      } else {
        _clearGroup();
        clearSelected();
      }

      _updateDragGroup();

      setSelectedDancers({
        payload: _group.children.map((child) => child.name)
      });
    }

    let _hover = null;

    function onPointerMove (event) {
      updatePointer(event);
      _intersections.length = 0;

      _raycaster.setFromCamera(_pointer, _camera);
      _raycaster.intersectObjects(_objects, true, _intersections);

      if (_intersections.length > 0) {
        const { name } = _intersections[0].object.parent;
        if (_hover && _hover !== name) _unhoverByName(_hover);
        _hover = name;
        _hoverByName(_hover);
      } else if (_hover) {
        _unhoverByName(_hover);
        _hover = null;
      }
    }

    function _hoverByName (name) {
      _dancers[name].hover();
    }

    function _unhoverByName (name) {
      _dancers[name].unhover();
    }

    function _clearGroup () {
      while (_group.children.length > 0) {
        const object = _group.children[0];
        _scene.attach(object);
      }
    }

    function _addToGroup (object) {
      _group.attach(object);
    }

    function _removeFromGroup (object) {
      _scene.attach(object);
    }

    function _updateDragGroup () {
      const draggableObjects = _dragControls.getObjects();
      draggableObjects.length = 0;
      if (_group.children.length > 0) {
        _dragControls.transformGroup = true;
        draggableObjects.push(_group);
        _selected = _group.children.map((child) => child.name);
      }
    }

    function updateSelected (selected) {
      const selectedObjects = [];
      Object.entries(selected).forEach(([name, value]) => {
        _dancers[name].updateSelected(value.selected);
        const dancer = _dancers[name];

        if (value.selected) {
          _group.attach(dancer.model);
        } else {
          _scene.attach(dancer.model);
        }

        selectedObjects.push(
          ..._dancers[name].model.children.filter(
            (part) =>
              part.name !== "nameTag" &&
              ((part.name === "Human" && value.selected) ||
                value.parts.includes(part.name))
          )
        );
      });

      _updateDragGroup();

      if (scope.selectedOutline) {
        scope.selectedOutline.selectedObjects = selectedObjects;
      }
    }

    function updatePointer (event) {
      const rect = _domElement.getBoundingClientRect();

      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function setSelectedOutline (selectedOutline) {
      this.selectedOutline = selectedOutline;
    }

    activate(_mode);

    // API

    this.enabled = true;
    this.enableMultiSelection = false;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;
    this.getObjects = getObjects;
    this.getGroup = getGroup;
    this.getRaycaster = getRaycaster;
    this.setSelectedOutline = setSelectedOutline;
    this.updateSelected = updateSelected;
  }
}

export { SelectControls };
