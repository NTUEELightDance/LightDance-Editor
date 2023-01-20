import { SpeedDial, SpeedDialIcon, SpeedDialAction } from "@mui/material";

import { FaTshirt, FaArrowsAlt } from "react-icons/fa";
import DancerIcon from "@mui/icons-material/AccessibilityNewRounded";

import { reactiveState } from "@/core/state";
import { setSelectionMode } from "@/core/actions";
import { useReactiveVar } from "@apollo/client";

import {
  POS_EDITOR,
  CONTROL_EDITOR,
  DANCER,
  PART,
  POSITION,
} from "@/constants";

function SelectionModeSelector() {
  const selectionMode = useReactiveVar(reactiveState.selectionMode);
  const editor = useReactiveVar(reactiveState.editor);

  const icons: Record<string, JSX.Element> = {
    [DANCER]: <DancerIcon />,
    [PART]: <FaTshirt />,
    [POSITION]: <FaArrowsAlt />,
  };

  return (
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
        // Disable tools by its mode
        const disabled =
          (editor === POS_EDITOR && mode !== POSITION) ||
          (editor === CONTROL_EDITOR && mode === POSITION);

        return (
          <SpeedDialAction
            key={mode}
            icon={icon}
            tooltipTitle={mode}
            onClick={async () => {
              await setSelectionMode({ payload: mode });
            }}
            // @ts-expect-error: Unreachable code error
            disabled={disabled}
          />
        );
      })}
    </SpeedDial>
  );
}

export default SelectionModeSelector;
