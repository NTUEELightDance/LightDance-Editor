import { useState, useRef } from "react";
import type { ReactiveVar } from "@apollo/client";
import { type DancerStatus, isFiberData, isLEDData } from "core/models";

// mui
import Snackbar from "@mui/material/Snackbar";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// states and actions
import { reactiveState } from "@/core/state";
import { editCurrentStatusFiber, editCurrentStatusLED } from "@/core/actions";
import { makeVar } from "@apollo/client";
import { DANCER } from "@/constants";

// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

/**
 * Clipboard component for copy/paste
 */
export default function Clipboard() {
  const copiedStatus = useRef<ReactiveVar<DancerStatus>>(makeVar({}));

  useHotkeys("ctrl+c, cmd+c", () => {
    const selected = Object.keys(reactiveState.selected()).find(
      (name) => reactiveState.selected()[name].selected
    );
    const currentStatus = reactiveState.currentStatus();
    if (selected) {
      setMessage("Copied to the Clipboard!");
      setOpen(true);
      copiedStatus.current(currentStatus[selected]);
    }
  });

  useHotkeys("ctrl+v, cmd+v", () => {
    // paste to the dancer
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
                payload: {
                  dancerName: dancer,
                  partName: part,
                  value,
                },
              });
            }
          }
        });
      });
    }
  });

  // snackbar logic
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleClose = () => {
    setOpen(false);
  };

  const action = (
    <IconButton size="small" aria-label="close" onClick={handleClose}>
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message={message}
        action={action}
      />
    </div>
  );
}
