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
  pushStatusStack,
  DecrementStatusStackIndex,
  IncrementStatusStackIndex,
  setSelectedDancers,
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
    if (selectionMode === DANCER) {
      if (selected.length === 0) {
        notification.error(`Please select dancers first!`);
        return;
      }
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
      notification.success(`Pasted to dancers: ${selected.join(", ")}`);
    }
  });

  useHotkeys("ctrl+z, meta+z", () => {
    const statusStack = reactiveState.statusStack();
    const statusStackIndex = reactiveState.statusStackIndex();
    // no more undo history
    if (statusStackIndex === 0) {
      notification.error("No more undo history");
      return;
    }
    DecrementStatusStackIndex();
    setCurrentStatus({
      payload: statusStack[statusStackIndex - 1],
    });
    notification.success("Undo");
  });

  useHotkeys("ctrl+shift+z, meta+shift+z", () => {
    const statusStack = reactiveState.statusStack();
    const statusStackIndex = reactiveState.statusStackIndex();
    // no more redo history
    if (statusStackIndex === statusStack.length - 1) {
      notification.error("It's the latset status");
      return;
    }
    setCurrentStatus({
      payload: statusStack[statusStackIndex + 1],
    });
    IncrementStatusStackIndex();
    notification.success("Redo");
    log("statusStack", statusStack);
  });

  useHotkeys("ctrl+x, meta+x", () => {
    const selected = Object.keys(reactiveState.selected()).filter(
      (name) => reactiveState.selected()[name].selected
    );
    const currentStatus = reactiveState.currentStatus();
    const selectionMode = reactiveState.selectionMode();
    if (selectionMode === DANCER) {
      if (selected.length === 0) {
        notification.error(`Please select dancers first!`);
        return;
      }
      selected.forEach((dancer) => {
        copiedStatus.current(currentStatus[dancer]);
        Object.keys(currentStatus[dancer]).forEach((part) => {
          const value = currentStatus[dancer][part];
          if (isFiberData(value)) {
            editCurrentStatusFiber({
              payload: {
                dancerName: dancer,
                partName: part,
                value: {
                  color: "#000000",
                  alpha: 0,
                },
              },
            });
          } else if (isLEDData(value)) {
            editCurrentStatusLED({
              payload: [
                {
                  dancerName: dancer,
                  partName: part,
                  value: {
                    src: "no-effect",
                    alpha: 0,
                  },
                },
              ],
            });
          }
        });
      });
      pushStatusStack();
      notification.success(`cut dancer: ${selected.join(", ")} light effect`);
    }
  });

  useHotkeys("ctrl+a, meta+a", (e) => {
    e.preventDefault();
    const selectionMode = reactiveState.selectionMode();
    const dancerNames = reactiveState.dancerNames();
    if (selectionMode === DANCER) {
      setSelectedDancers({
        payload: dancerNames,
      });
    }
  });

  useHotkeys("ctrl+shift+a, meta+shift+a", (e) => {
    e.preventDefault();
    const selectionMode = reactiveState.selectionMode();
    if (selectionMode === DANCER) {
      setSelectedDancers({
        payload: [],
      });
    }
  });

  return <></>;
}
