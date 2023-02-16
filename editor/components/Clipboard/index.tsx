import { useRef } from "react";
import type { ReactiveVar } from "@apollo/client";

import { useHotkeys } from "react-hotkeys-hook";
import { makeVar } from "@apollo/client";

import type { DancerStatus } from "@/core/models";
import { isFiberData, isLEDData } from "@/core/models";

import { reactiveState } from "@/core/state";
import {
  setCurrentStatus,
  editCurrentStatusFiber,
  editCurrentStatusLED,
  setStatusStack,
} from "@/core/actions";
import { DANCER } from "@/constants";

import { notification } from "@/core/utils";

import { log } from "core/utils";

/**
 * Clipboard component for copy/paste
 */
export default function Clipboard() {
  const copiedStatus = useRef<ReactiveVar<DancerStatus>>(makeVar({}));

  useHotkeys("ctrl+c, meta+c", () => {
    const selected = Object.keys(reactiveState.selected()).find(
      (name) => reactiveState.selected()[name].selected
    );
    const currentStatus = reactiveState.currentStatus();
    if (selected) {
      notification.success(`Copied ${selected}'s state to clipboard!`);
      copiedStatus.current(currentStatus[selected]);
    }
  });

  useHotkeys("ctrl+v, meta+v", () => {
    const selected = Object.keys(reactiveState.selected()).filter(
      (name) => reactiveState.selected()[name].selected
    );
    const currentStatus = reactiveState.currentStatus();
    const selectionMode = reactiveState.selectionMode();
    let CannotPasted = false;
    if (selectionMode === DANCER) {
      selected.forEach((dancer) => {
        Object.keys(copiedStatus.current()).forEach((part) => {
          if (CannotPasted) return;
          else if (Object.keys(currentStatus[dancer]).includes(part)) {
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
          } else {
            notification.error(
              `Cannot paste to ${dancer} since ${part} does not exist`
            );
            CannotPasted = true;
            return;
          }
        });
      });
      if (!CannotPasted) {
        setStatusStack();
        notification.success(`Pasted to dancers: ${selected.join(", ")}`);
      }
    }
  });

  useHotkeys("ctrl+z, meta+z", () => {
    const statusStack = reactiveState.statusStack();
    // no more undo history
    if (statusStack.length === 1) {
      notification.error("No more undo history");
      return;
    }
    statusStack.pop();
    log(statusStack[statusStack.length - 1]);
    setCurrentStatus({
      payload: statusStack[statusStack.length - 1],
    });
    reactiveState.statusStack(statusStack);
    notification.success("Undo");
    log("Status stack", statusStack);
  });

  useHotkeys("ctrl+x, meta+x", () => {
    log("cut");
    const selected = Object.keys(reactiveState.selected()).find(
      (name) => reactiveState.selected()[name].selected
    );
    if (selected) {
      const currentStatus = reactiveState.currentStatus();
      const statusStack = reactiveState.statusStack();
      copiedStatus.current(currentStatus[selected]);
      currentStatus[selected] = statusStack[0][selected];
      setCurrentStatus({
        payload: currentStatus,
      });
      setStatusStack();
      notification.success(`Cut ${selected}'s state to clipboard!`);
    }
  });

  return <></>;
}
