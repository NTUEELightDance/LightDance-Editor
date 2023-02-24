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
  setCurrentTime,
} from "@/core/actions";
import { DANCER, POSITION, PART } from "@/constants";

import { notification } from "@/core/utils";

import { throttle } from "lodash";

const THROTTLE = 100;

/**
 * Clipboard component for copy/paste
 */
export default function Clipboard() {
  const copiedStatus = useRef<ReactiveVar<DancerStatus>>(makeVar({}));
  const timeShift = (time: number): void => {
    // time increase / decrease several ms
    const currentTime = reactiveState.currentTime();
    const newTime = Math.max(0, currentTime + time);
    setCurrentTime({
      payload: newTime,
    });
  };

  useHotkeys("ctrl+c, meta+c", () => {
    const selected = Object.keys(reactiveState.selected()).find(
      (name) => reactiveState.selected()[name].selected
    );
    const selectionMode = reactiveState.selectionMode();
    if (selectionMode === DANCER) {
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
    if (selectionMode === DANCER) {
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
    if (selectionMode === DANCER || selectionMode === PART) {
      const statusStackIndex = reactiveState.statusStackIndex();
      // no more undo history
      if (statusStackIndex === 0) {
        notification.error("No more undo history");
        return;
      }
      DecrementStatusStackIndex();
    } else if (selectionMode === POSITION) {
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
    if (selectionMode === DANCER || selectionMode === PART) {
      const statusStack = reactiveState.statusStack();
      const statusStackIndex = reactiveState.statusStackIndex();
      // no more redo history
      if (statusStackIndex === statusStack.length - 1) {
        notification.error("It's the latest status");
        return;
      }
      IncrementStatusStackIndex();
    } else if (selectionMode === POSITION) {
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

  useHotkeys("ctrl+x, meta+x", () => {
    const selected = Object.keys(reactiveState.selected()).filter(
      (name) => reactiveState.selected()[name].selected
    );
    const selectionMode = reactiveState.selectionMode();
    if (selected.length === 0) {
      notification.error(`Please select dancers first!`);
      return;
    }
    if (selectionMode === DANCER) {
      const currentStatus = reactiveState.currentStatus();
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
                    src: "",
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
    if (selectionMode === DANCER || selectionMode === POSITION) {
      setSelectedDancers({
        payload: dancerNames,
      });
    }
  });

  useHotkeys("ctrl+shift+a, meta+shift+a", (e) => {
    e.preventDefault();
    const selectionMode = reactiveState.selectionMode();
    if (selectionMode === DANCER || selectionMode === POSITION) {
      setSelectedDancers({
        payload: [],
      });
    }
  });

  useHotkeys(
    "left",
    throttle(() => {
      timeShift(-100);
    }, THROTTLE)
  );
  useHotkeys(
    "right",
    throttle(() => {
      // time increase 100ms
      timeShift(100);
    }, THROTTLE)
  );

  useHotkeys(
    "shift+left",
    throttle(() => {
      // time decrease 500ms
      timeShift(-500);
    }, THROTTLE)
  );

  useHotkeys(
    "shift+right",
    throttle(() => {
      // time increase 500ms
      timeShift(500);
    }, THROTTLE)
  );

  return <></>;
}
