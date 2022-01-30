import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

// mui
import Snackbar from "@mui/material/Snackbar";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// states and actions
import { reactiveState } from "core/state";
import { editCurrentStatus } from "core/actions";
import { makeVar } from "@apollo/client";
import { DANCER } from "constants";

// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

import {
  CheckTypeOfEl,
  CheckTypeOfFiber,
  CheckTypeOfLED,
} from "core/utils/math";
import { LED, El, Fiber } from "types/globalSlice";
import Dancer from "components/Simulator/Dancer";

/**
 * Clipboard component for copy/paste
 */
export default function Clipboard() {
  const copiedStatus = useRef(makeVar({}));

  useHotkeys("ctrl+c, cmd+c", () => {
    setMessage("Copied to the Clipboard!");
    setOpen(true);

    const selected = Object.keys(reactiveState.selected());
    const currentStatus = reactiveState.currentStatus();

    console.log("copied", currentStatus[selected[0]]);
    copiedStatus.current(currentStatus[selected[0]]);
  });

  useHotkeys("ctrl+v, cmd+v", () => {
    // paste to the dancer
    console.log("Paste", copiedStatus.current());
    const selected = Object.keys(reactiveState.selected());
    const currentStatus = reactiveState.currentStatus();
    const selectionMode = reactiveState.selectionMode();
    if (selectionMode === DANCER) {
      selected.forEach((dancer) => {
        Object.keys(copiedStatus.current()).forEach((part) => {
          if (Object.keys(currentStatus[dancer]).includes(part))
            editCurrentStatus({
              payload: {
                dancerName: dancer,
                partName: part,
                value: copiedStatus.current()[part],
              },
            });
        });
      });
    }
  });

  // useHotkeys("ctrl+b, cmd+b", () => {
  //   // paste only light part
  //   console.log("Paste", copiedStatus.current());
  //   const selected = reactiveState.selected();
  //   const currentStatus = reactiveState.currentStatus();
  //   Object.keys(copiedStatus.current()).forEach((part) => {
  //     if (Object.keys(currentStatus[selected[0]]).includes(part))
  //       editCurrentStatus({
  //         payload: {
  //           dancerName: selected[0],
  //           partName: part,
  //           value: copiedStatus.current()[part],
  //         },
  //       });
  //   });
  // });

  // function changeLightPart(
  //   formerPart: LED | El | Fiber,
  //   latterPart: LED | El | Fiber
  // ): LED | El | Fiber {
  //   if (CheckTypeOfLED(formerPart) && CheckTypeOfLED(latterPart)) {
  //     return formerPart.alpha > latterPart.alpha ? formerPart : latterPart;
  //   } else if (CheckTypeOfEl(formerPart) && CheckTypeOfEl(latterPart)) {
  //     //if (typeof preVal === "number" && typeof nextVal === "number") {
  //     return formerPart > latterPart ? formerPart : latterPart;

  //     //}
  //   }
  //   // fiber Parts
  //   else if (CheckTypeOfFiber(formerPart) && CheckTypeOfFiber(latterPart)) {
  //     return formerPart.alpha > latterPart.alpha ? formerPart : latterPart;
  //   } else {
  //     throw new Error(
  //       `[Error] pasteLights, invalid parts ${formerPart}, ${latterPart}`
  //     );
  //   }
  // }

  // snackbar logic
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
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
