import { useRef } from "react";
import type { ReactiveVar } from "@apollo/client";

import { useHotkeys } from "react-hotkeys-hook";
import { makeVar } from "@apollo/client";

import type { DancerStatus } from "@/core/models";
import { isFiberData, isLEDData } from "@/core/models";

import { reactiveState } from "@/core/state";
import {
  editCurrentStatusFiber,
  editCurrentStatusLED,
  pushStatusStack,
  DecrementStatusStackIndex,
  IncrementStatusStackIndex,
  DecrementPosStackIndex,
  IncrementPosStackIndex,
  setSelectedDancers,
} from "@/core/actions";

import { notification } from "@/core/utils";

/**
 * Clipboard component for copy/paste
 */
export default function Clipboard() {
  const copiedStatus = useRef<ReactiveVar<DancerStatus>>(makeVar({}));

  useHotkeys("ctrl+c, meta+c", () => {
    const selected = Object.keys(reactiveState.selected()).find(
      (name) => reactiveState.selected()[name].selected
    );
    const selectionMode = reactiveState.selectionMode();
    if (selectionMode === "DANCER_MODE") {
      const currentStatus = reactiveState.currentStatus();
      if (selected) {
        notification.success(`Copied ${selected}'s state to clipboard!`);
        copiedStatus.current(currentStatus[selected]);
      }
    }
  });

  useHotkeys("ctrl+v, meta+v", () => {
    const selected = Object.keys(reactiveState.selected()).filter(
      (name) => reactiveState.selected()[name].selected
    );
    const selectionMode = reactiveState.selectionMode();
    if (selected.length === 0) {
      notification.error(`Please select dancers first!`);
      return;
    }
    if (selectionMode === "DANCER_MODE") {
      const currentStatus = reactiveState.currentStatus();
      selected.forEach((dancer) => {
        Object.keys(copiedStatus.current()).forEach((part) => {
          if (Object.keys(currentStatus[dancer]).includes(part)) {
            const value = copiedStatus.current()[part];
            if (isFiberData(value)) {
              editCurrentStatusFiber({
                payload: {
                  dancerName: dancer,
                  partName: part,
                  value,
                },
              });
            } else if (isLEDData(value)) {
              editCurrentStatusLED({
                payload: [
                  {
                    dancerName: dancer,
                    partName: part,
                    value,
                  },
                ],
              });
            }
          }
        });
      });
      pushStatusStack();
      notification.success(`Pasted status to dancers: ${selected.join(", ")}`);
    }
  });

  useHotkeys("ctrl+z, meta+z", () => {
    const selectionMode = reactiveState.selectionMode();
    if (selectionMode === "DANCER_MODE" || selectionMode === "PART_MODE") {
      const statusStackIndex = reactiveState.statusStackIndex();
      // no more undo history
      if (statusStackIndex === 0) {
        notification.error("No more undo history");
        return;
      }
      DecrementStatusStackIndex();
    } else if (selectionMode === "POSITION_MODE") {
      const posStackIndex = reactiveState.posStackIndex();
      // no more undo history
      if (posStackIndex === 0) {
        notification.error("No more undo history");
        return;
      }
      DecrementPosStackIndex();
    }
    notification.success("Undo");
  });

  useHotkeys("ctrl+shift+z, meta+shift+z", () => {
    const selectionMode = reactiveState.selectionMode();
    if (selectionMode === "DANCER_MODE" || selectionMode === "PART_MODE") {
      const statusStack = reactiveState.statusStack();
      const statusStackIndex = reactiveState.statusStackIndex();
      // no more redo history
      if (statusStackIndex === statusStack.length - 1) {
        notification.error("It's the latest status");
        return;
      }
      IncrementStatusStackIndex();
    } else if (selectionMode === "POSITION_MODE") {
      const posStack = reactiveState.posStack();
      const posStackIndex = reactiveState.posStackIndex();
      // no more redo history
      if (posStackIndex === posStack.length - 1) {
        notification.error("It's the latest position");
        return;
      }
      IncrementPosStackIndex();
    }
    notification.success("Redo");
  });

  useHotkeys("ctrl+a, meta+a", (e) => {
    e.preventDefault();
    const selectionMode = reactiveState.selectionMode();
    const dancerNames = reactiveState.dancerNames();
    if (selectionMode === "DANCER_MODE" || selectionMode === "POSITION_MODE") {
      setSelectedDancers({
        payload: dancerNames,
      });
    }
  });

  useHotkeys("ctrl+shift+a, meta+shift+a", (e) => {
    e.preventDefault();
    const selectionMode = reactiveState.selectionMode();
    if (selectionMode === "DANCER_MODE" || selectionMode === "POSITION_MODE") {
      setSelectedDancers({
        payload: [],
      });
    }
  });

  return <></>;
}
