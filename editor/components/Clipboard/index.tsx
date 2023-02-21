import { useRef } from "react";
import type { ReactiveVar } from "@apollo/client";

import { useHotkeys } from "react-hotkeys-hook";
import { makeVar } from "@apollo/client";

import type { DancerStatus } from "@/core/models";
import { isFiberData, isLEDData } from "@/core/models";

import { reactiveState } from "@/core/state";
import { editCurrentStatusFiber, editCurrentStatusLED } from "@/core/actions";
import { DANCER } from "@/constants";

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

      notification.success(`Pasted to dancers: ${selected.join(", ")}`);
    }
  });

  return <></>;
}
