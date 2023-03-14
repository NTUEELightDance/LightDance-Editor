import {
  EventDispatcher,
  Raycaster,
  Vector2,
  Group,
  type Intersection,
  type Object3D,
  type Renderer,
  type PerspectiveCamera,
  type Scene,
} from "three";

import {
  setSelectedDancers,
  clearSelected,
  setSelectedLEDBulbs,
  setSelectedParts,
} from "@/core/actions";
import { state } from "@/core/state";
import { SelectionBox } from "./SelectionBox";
import { SelectionHelper } from "./SelectionHelper";
import { throttle } from "throttle-debounce";
import type {
  DancerName,
  LEDPartName,
  Selected,
  SelectionMode,
} from "@/core/models";
import { SelectedPartPayload } from "@/core/models";
import { isLEDPartName } from "@/core/models";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

// @ts-expect-error no types for module css
import styles from "./controls.module.css";
import { type Dancer } from "../ThreeComponents";
import { type DragControls } from "./DragControls";

import _ from "lodash";

const _raycaster = new Raycaster();
const _pointer = new Vector2();
const _group = new Group();

class SelectControls extends EventDispatcher {
  helper: SelectionHelper;
  enabled: boolean;
  enableMultiSelection: boolean;
  onLasso: boolean;
  blocking: boolean;
  selectedOutlinePass: OutlinePass;

  activate: (mode: SelectionMode) => void;
  deactivate: () => void;
  dispose: () => void;
  getObjects: () => Object3D[];
  getGroup: () => Group;
  getRaycaster: () => Raycaster;
  updateSelected: (selected: Selected, selectionMode: SelectionMode) => void;

  constructor(
    _objects: Object3D[],
    _camera: PerspectiveCamera,
    _domElement: HTMLCanvasElement,
    _dragControls: DragControls,
    _dancers: Record<string, Dancer>,
    _scene: Scene,
    _renderer: Renderer,
    _outlinePass: OutlinePass
  ) {
    super();

    this.selectedOutlinePass = _outlinePass;

    _domElement.style.touchAction = "none"; // disable touch scroll

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let _selected = null;
    let _mode: SelectionMode = "DANCER_MODE";

    const _intersections: Intersection<Object3D<Event>>[] = [];
    _scene.add(_group);

    const selectionBox = new SelectionBox(_camera, _scene);
    this.helper = new SelectionHelper(_renderer, styles.selectionBox);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scope = this;
    function activate(mode: SelectionMode) {
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

    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0 || scope.enabled === false) return;

      scope.helper.onSelectStart(event);

      if (state.selectionMode !== "POSITION_MODE") {
        scope.onLasso = true;
        const rect = _domElement.getBoundingClientRect();
        selectionBox.startPoint.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
          0.5
        );
        selectionBox.endPoint.copy(selectionBox.startPoint);
        selectionBox.select();
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
          if (_group.children.includes(object!)) {
            _removeFromGroup(object!);
          } else {
            _addToGroup(object!);
          }
        }
        // Single Selection Mode
        else {
          if (!_group.children.includes(object!)) {
            _clearGroup();
            _addToGroup(object!);
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

    let _hover: string | null = null;

    function onPointerMove(event: PointerEvent) {
      if (scope.enabled === false) return;

      // handle lasso selection
      if (
        scope.onLasso &&
        event.buttons & 1 &&
        state.selectionMode !== "POSITION_MODE"
      ) {
        scope.helper.onSelectMove(event);
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
      } else {
        // handle hover
        updatePointer(event);
        _intersections.length = 0;

        _raycaster.setFromCamera(_pointer, _camera);
        _raycaster.intersectObjects(_objects, true, _intersections);

        if (_intersections.length > 0) {
          const { name } = _intersections[0].object.parent!;
          if (_hover && _hover !== name) _unhoverByName(_hover);
          _hover = name;
          _hoverByName(_hover);
        } else if (_hover) {
          _unhoverByName(_hover);
          _hover = null;
        }
      }
    }

    function onPointerUp() {
      if (!scope.onLasso) return;
      scope.onLasso = false;

      scope.helper.onSelectOver();

      if (state.selectionMode === "DANCER_MODE") {
        if (selectionBox.collection.length > 0) {
          const dancers: string[] = [];
          selectionBox.collection.forEach((part) => {
            const name = part.name;
            if (name === "Human") {
              dancers.push(part.parent!.name);
            }
          });
          setSelectedDancers({ payload: dancers });
        }
      } else if (state.selectionMode === "PART_MODE") {
        const parts: SelectedPartPayload = {};
        const uniqueNames = _.uniqBy(
          selectionBox.collection
            .map((part) => ({
              parentName: part.parent!.name,
              name: part.name.replace(/\d{3}$/, ""),
            }))
            .filter(({ name }) => name !== "Human" && name !== "nameTag"),
          ({ parentName, name }) => `${parentName}-${name}`
        );

        uniqueNames.forEach(({ parentName, name }) => {
          parts[parentName] ??= [];
          parts[parentName].push(name);
        });

        setSelectedParts({ payload: parts });
      } else if (state.selectionMode === "LED_MODE") {
        const currentLEDPartName = state.currentLEDPartName;
        if (!isLEDPartName(currentLEDPartName)) return;
        const referenceDancerName = state.currentLEDEffectReferenceDancer;

        const partsIndex: number[] = [];
        selectionBox.collection.forEach((part) => {
          const partName = part.name;
          if (!isLEDPartName(partName)) return;

          const parentName = part.parent!.name;

          if (
            parentName === referenceDancerName &&
            partName.startsWith(currentLEDPartName)
          ) {
            const partNumber = partName.match(/\d{3}$/)?.[0];

            if (!partNumber) {
              return;
            }

            // the -1 is important because the LED parts are 1-indexed in the model
            partsIndex.push(parseInt(partNumber) - 1);
          }
        });

        setSelectedLEDBulbs({ payload: partsIndex });
      }
    }

    function _hoverByName(name: string) {
      _dancers[name].hover();
    }

    function _unhoverByName(name: string) {
      _dancers[name].unhover();
    }

    function _clearGroup() {
      while (_group.children.length > 0) {
        const object = _group.children[0];
        _scene.attach(object);
      }
    }

    function _addToGroup(object: Object3D) {
      _group.attach(object);
    }

    function _removeFromGroup(object: Object3D) {
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

    function updateSelected(selected: Selected, selectionMode: SelectionMode) {
      const selectedObjects: Object3D[] = [];
      const selectedLEDParts: Record<DancerName, Set<LEDPartName>> = {};

      // push dancer and fiber parts and collect LED parts
      Object.entries(selected).forEach(
        ([dancerName, { selected: dancerSelected, parts: selectedParts }]) => {
          _dancers[dancerName].updateSelected(dancerSelected);
          const dancer = _dancers[dancerName];

          if (dancerSelected) {
            _group.attach(dancer.model);
          } else {
            _scene.attach(dancer.model);
          }

          selectedObjects.push(
            ..._dancers[dancerName].model.children.filter((part) => {
              if (part.name === "nameTag") {
                return false;
              }

              if (
                selectionMode === "DANCER_MODE" ||
                selectionMode === "POSITION_MODE"
              ) {
                if (part.name === "Human" && dancerSelected) {
                  return true;
                }
              }

              selectedLEDParts[dancerName] ??= new Set();
              if (
                isLEDPartName(part.name) &&
                selectedParts.some((partName) => part.name.startsWith(partName))
              ) {
                // strip the trailing number
                const partName = part.name.replace(/\d{3}$/, "") as LEDPartName;
                selectedLEDParts[dancerName].add(partName);
                return false;
              }

              return selectedParts.includes(part.name);
            })
          );
        }
      );

      // push all LED bulbs of selected LED parts
      Object.entries(selectedLEDParts).forEach(([dancerName, parts]) => {
        const dancer = _dancers[dancerName];
        dancer.setSelectedLEDParts(parts);
      });

      _updateDragGroup();

      //called only dancer selected
      scope.selectedOutlinePass.selectedObjects = selectedObjects;
    }

    function updatePointer(event: PointerEvent) {
      const rect = _domElement.getBoundingClientRect();

      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;
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
    this.updateSelected = updateSelected;
  }
}

export { SelectControls };
