import { SpeedDial, SpeedDialIcon, SpeedDialAction } from "@mui/material";

import { FaTshirt } from "react-icons/fa";
import DancerIcon from "@mui/icons-material/AccessibilityNewRounded";
import OpenWithRoundedIcon from "@mui/icons-material/OpenWithRounded";
import BlurOnIcon from "@mui/icons-material/BlurOn";

import { reactiveState } from "@/core/state";
import { setSelectionMode } from "@/core/actions";
import { useReactiveVar } from "@apollo/client";

import { SelectionMode } from "@/core/models";
import { useHotkeys } from "react-hotkeys-hook";

const icons = {
  DANCER_MODE: <DancerIcon />,
  PART_MODE: <FaTshirt />,
  LED_MODE: <BlurOnIcon />,
  POSITION_MODE: <OpenWithRoundedIcon />,
} as const;

function SelectionModeSelector() {
  const selectionMode = useReactiveVar(reactiveState.selectionMode);
  const editor = useReactiveVar(reactiveState.editor);

  // use v to toggle between dancer and part mode
  useHotkeys("v", () => {
    if (editor !== "CONTROL_EDITOR") return;

    if (selectionMode === "DANCER_MODE") {
      setSelectionMode({ payload: "PART_MODE" });
    } else if (selectionMode === "PART_MODE") {
      setSelectionMode({ payload: "DANCER_MODE" });
    }
  });

  return (
    <div>
      <SpeedDial
        ariaLabel="set selection mode"
        sx={{ position: "absolute", top: "16px", right: "16px" }}
        FabProps={{ size: "small" }}
        icon={
          <SpeedDialIcon
            icon={icons[selectionMode]}
            openIcon={icons[selectionMode]}
          />
        }
        direction="down"
      >
        {Object.entries(icons).map(([mode, icon]) => {
          const selectionMode = mode as SelectionMode;

          let disabled = false;
          if (editor === "CONTROL_EDITOR") {
            if (
              selectionMode !== "DANCER_MODE" &&
              selectionMode !== "PART_MODE"
            ) {
              disabled = true;
            }
          } else if (editor === "POS_EDITOR") {
            if (selectionMode !== "POSITION_MODE") disabled = true;
          } else if (editor === "LED_EDITOR") {
            if (selectionMode !== "LED_MODE") disabled = true;
          }

          return (
            <SpeedDialAction
              key={mode}
              icon={icon}
              tooltipTitle={mode}
              onClick={async () => {
                await setSelectionMode({ payload: selectionMode });
              }}
              // @ts-expect-error: Unreachable code error
              disabled={disabled}
            />
          );
        })}
      </SpeedDial>
    </div>
  );
}

export default SelectionModeSelector;
