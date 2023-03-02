import {
  EventDispatcher,
  Raycaster,
  Vector2,
  Group,
  WebGLRenderer,
  PCFShadowMap,
  type Intersection,
  type Object3D,
} from "three";
import {
  setSelectedDancers,
  clearSelected,
  setSelectedLEDParts,
  setSelectedParts,
} from "@/core/actions";
import { state } from "@/core/state";
import { SelectionBox } from "./SelectionBox";
import { SelectionHelper } from "./SelectionHelper";
import { throttle } from "throttle-debounce";
import type { SelectionMode } from "@/core/models";
import { SelectedPartPayload } from "@/core/models";
import { isLEDPartName } from "@/core/models";

const _raycaster = new Raycaster();
const _pointer = new Vector2();
const _group = new Group();

class SelectControls extends EventDispatcher {
  constructor(_objects, _camera, _domElement, _dragControls, _dancers, _scene) {
    super();

    _domElement.style.touchAction = "none"; // disable touch scroll

    let _selected = null;
    let _mode: SelectionMode = "DANCER_MODE";

    const _intersections: Intersection<Object3D<Event>>[] = [];
    _scene.add(_group);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;

    const selectionBox = new SelectionBox(_camera, _scene);
    const helper = new SelectionHelper(renderer, "selectBox");

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scope = this;
    function activate(mode) {
      _domElement.addEventListener("pointerdown", onPointerDown);
      _domElement.addEventListener(
        "pointermove",
        throttle(1000 / 30, onPointerMove)
      );
      _domElement.addEventListener("pointerup", onPointerUp);
      _mode = mode;
    }

    function deactivate() {
      _domElement.removeEventListener("pointerdown", onPointerDown);
      _domElement.removeEventListener(
        "pointermove",
        throttle(1000 / 30, onPointerMove)
      );
      _domElement.removeEventListener("pointerup", onPointerUp);
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

      if (state.selectionMode !== "POSITION_MODE") {
        scope.onLasso = true;
        const rect = _domElement.getBoundingClientRect();
        selectionBox.startPoint.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
          0.5
        );
      }

      updatePointer(event);

      _intersections.length = 0;
      _raycaster.setFromCamera(_pointer, _camera);
      _raycaster.intersectObjects(_objects, true, _intersections);
      //objects: objects to check
      //true: recursive or not
      //intersections: the variable of the result

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
      if (
        state.selectionMode === "DANCER_MODE" ||
        state.selectionMode === "POSITION_MODE"
      ) {
        setSelectedDancers({
          payload: _group.children.map((child) => child.name),
        });
      }
    }

    let _hover = null;

    function onPointerMove(event) {
      if (state.selectionMode === "POSITION_MODE") {
        return;
      }
      if (scope.onLasso) {
        updatePointer(event);
        _raycaster.setFromCamera(_pointer, _camera);
        const rect = _domElement.getBoundingClientRect();
        selectionBox.endPoint.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
          0.5
        );
        selectionBox.select();
        return;
      }
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

    function onPointerUp(event) {
      if (scope.onLasso === true) {
        scope.onLasso = false;

        if (selectionBox.collection.length > 0) {
          if (state.selectionMode === "DANCER_MODE") {
            const dancers: string[] = [];
            selectionBox.collection.forEach((part, index) => {
              const name = part.name;
              if (name === "Human") {
                dancers.push(part.parent.name);
              }
            });
            setSelectedDancers({ payload: dancers });
          }
        } else if (state.selectionMode === "PART_MODE") {
          const parts: SelectedPartPayload = {};
          selectionBox.collection.forEach((part, index) => {
            const name = part.name;
            if (
              name !== "Human" &&
              name !== "nameTag" &&
              !isLEDPartName(name)
            ) {
              parts[part.parent.name] ??= [];
              parts[part.parent.name].push(name);
            }
          });
          setSelectedParts({ payload: parts });
        } else if (state.selectionMode === "LED_MODE") {
          let dancerName = "";
          let partName = "";

          for (const part of selectionBox.collection) {
            if (isLEDPartName(part.name)) {
              dancerName = part.parent.name;
              partName = part.name.slice(0, -3);
              break;
            }
          }

          const partsIndex: number[] = [];
          selectionBox.collection.forEach((part, index) => {
            const name = part.name;
            if (isLEDPartName(name) && partName !== "" && dancerName !== "") {
              if (
                part.parent.name === dancerName &&
                part.name.slice(0, -3) === partName
              ) {
                const partNumber: string = name.slice(-3);
                partsIndex.push(Number(partNumber));
              }
            }
          });
          const payload: {
            dancer: string;
            part: string;
            partsIndex: number[];
          } = {
            dancer: dancerName,
            part: partName,
            partsIndex: partsIndex,
          };
          setSelectedLEDParts({ payload: payload });
        }
      }
    }

    function _hoverByName(name) {
      _dancers[name].hover();
    }

    function _unhoverByName(name) {
      _dancers[name].unhover();
    }

    function _clearGroup() {
      while (_group.children.length > 0) {
        const object = _group.children[0];
        _scene.attach(object);
      }
    }

    function _addToGroup(object) {
      _group.attach(object);
    }

    function _removeFromGroup(object) {
      _scene.attach(object);
    }

    function _updateDragGroup() {
      const draggableObjects = _dragControls.getObjects();
      draggableObjects.length = 0;
      if (_group.children.length > 0) {
        _dragControls.transformGroup = true;
        draggableObjects.push(_group);
        _selected = _group.children.map((child) => child.name);
      }
    }

    function updateSelected(selected) {
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
      //called only dancer selected
      if (scope.selectedOutline) {
        scope.selectedOutline.selectedObjects = selectedObjects;
      }
    }

    function updatePointer(event) {
      const rect = _domElement.getBoundingClientRect();

      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function setSelectedOutline(selectedOutline) {
      this.selectedOutline = selectedOutline;
    }

    activate(_mode);

    // API

    this.enabled = true;
    this.enableMultiSelection = false;
    this.blocking = false;
    this.onLasso = false;
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
