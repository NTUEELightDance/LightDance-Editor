import {
  EventDispatcher,
  Raycaster,
  Vector2,
  Group,
  cloneUniformsGroups,
  WebGLRenderer,
  PCFShadowMap,
} from "three";
import {
  setSelectedDancers,
  clearSelected,
  getLasso,
} from "../../../core/actions";
import { DANCER, PART } from "@/constants";
import { SelectionBox } from "./SelectionBox";
import { SelectionHelper } from "./SelectionHelper";
import { throttle } from "throttle-debounce";

const _raycaster = new Raycaster();
const _pointer = new Vector2();
const _group = new Group();

class SelectControls extends EventDispatcher {
  constructor(_objects, _camera, _domElement, _dragControls, _dancers, _scene) {
    super();

    _domElement.style.touchAction = "none"; // disable touch scroll

    let _selected = null;
    let _mode = DANCER;

    const _intersections = [];
    const _intersectionsPartsBuffer = [];
    let _intersectionsParts = [];
    _scene.add(_group);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;

    const selectionBox = new SelectionBox(_camera, _scene);
    const helper = new SelectionHelper(renderer, "selectBox");
    const startX = 0;
    const startY = 0;

    const scope = this;

    function activate(mode) {
      _domElement.addEventListener("pointerdown", onPointerDown);
      _domElement.addEventListener(
        "pointermove",
        throttle(1000 / 30, onPointerMove)
      );

      _mode = mode;
    }

    function deactivate() {
      _domElement.removeEventListener("pointerdown", onPointerDown);
      _domElement.removeEventListener(
        "pointermove",
        throttle(1000 / 30, onPointerMove)
      );

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

    async function onPointerDown(event) {
      //在three js的場景中按下滑鼠就會觸發
      //FIXME: getLasso gets undefined
      const lasso = await getLasso();
      console.log(scope);
      if (lasso) {
        console.log("in the lasso mode");
        return;
      }

      console.log("event", event);
      if (event.button === 2) {
        scope.enabled = !scope.enabled;

        if (scope.blocking === true) {
          scope.blocking = false;
        }
        return;
      }
      if (scope.enabled === false) {
        scope.blocking = true;
        //TODO: selection box implement
        const rect = _domElement.getBoundingClientRect();
        console.log(selectionBox.startPoint);
        selectionBox.startPoint.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
          0.5
        );
        //TODO: finish
        return;
      }
      if (event.button !== 0 || scope.enabled === false) return;

      updatePointer(event);

      _intersections.length = 0;
      console.log("_objects = ", _objects[0]);
      _raycaster.setFromCamera(_pointer, _camera);
      console.log("_raycaster", _raycaster.camera);
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

      setSelectedDancers({
        payload: _group.children.map((child) => child.name),
      });
    }

    let _hover = null;

    const findUuid = (arr, uuid): boolean => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].object.uuid === uuid) {
          return true;
        }
      }
      return false;
    };
    function onPointerMove(event) {
      //滑鼠移動就會執行
      if (scope.blocking === true) {
        updatePointer(event);
        _raycaster.setFromCamera(_pointer, _camera);
        //TODO: selection box implement
        if (true) {
          console.log("selection collection", selectionBox.collection);
          //FIXME: Uncaught TypeError: Cannot read properties of undefined (reading 'set')
          // for (let i = 0; i < selectionBox.collection.length; i++) {
          //   selectionBox.collection[i].material.emissive.set(0x000000);
          // }
          const rect = _domElement.getBoundingClientRect();
          selectionBox.endPoint.set(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            (-(event.clientY - rect.top) / rect.height) * 2 + 1,
            0.5
          );

          const allSelected = selectionBox.select();

          for (let i = 0; i < allSelected.length; i++) {
            /**
             *this.meshes[i].material.emissive.setHex(
              parseInt(colorCode.replace(/^#/, ""), 16));
             */
            //FIXME: color cannot change when selected
            const selectedDisplay = {
              colorCode: "#FF0000",
              alpha: 255,
            };
            const display = selectedDisplay;
            const { colorCode, alpha } = display;
            allSelected[i].material.emissive.setHex(
              parseInt(colorCode.replace(/^#/, ""), 16)
            );
            allSelected[i].material.emissiveIntensity = alpha / 15;
          }
          // console.log("selection collection", selection.collection);
        }

        //TODO: finish
        let allParts = [];
        _objects.forEach((e, i) => {
          allParts = [...allParts, ...e.children];
        });
        _raycaster.intersectObjects(allParts, true, _intersectionsPartsBuffer);
        _intersectionsPartsBuffer.forEach((e, i) => {
          if (!_intersectionsParts.includes(e)) {
            if (
              !findUuid(_intersectionsParts, e.object.uuid) &&
              e.object.name.includes("LED")
            ) {
              console.log("add a new object", e.object.uuid);
              e.object.material.color.r = 1;
              _intersectionsParts = [..._intersectionsParts, e];
            }
          }
        });
        // console.log("_intersectionsParts", _intersectionsParts);
        return;
      }
      // console.log("onPointerMove");
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

    function _hoverByName(name) {
      //滑鼠在人身上就會執行
      _dancers[name].hover();
    }

    function _unhoverByName(name) {
      //滑鼠從人身上移開才會執行
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
      //用滑鼠點選人的時候會執行
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
