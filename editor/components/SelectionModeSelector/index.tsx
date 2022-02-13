import { SpeedDial, SpeedDialIcon, SpeedDialAction } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShirt,
  faArrowsUpDownLeftRight,
} from "@fortawesome/free-solid-svg-icons";
import DancerIcon from "@mui/icons-material/AccessibilityNewRounded";

import { reactiveState } from "../../core/state";
import { setSelectionMode } from "../../core/actions";
import { useReactiveVar } from "@apollo/client";

const SelectionModeSelector = () => {
  const selectionMode = useReactiveVar(reactiveState.selectionMode);
  const icons = {
    DANCER: <DancerIcon />,
    PART: (
      // to center the icon
      <div className="MuiSpeedDial-actionsClosed">
        <FontAwesomeIcon icon={faShirt} />
      </div>
    ),
    POSITION: (
      // to center the icon
      <div className="MuiSpeedDial-actionsClosed">
        <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
      </div>
    ),
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
      {Object.entries(icons).map(([mode, icon]) => (
        <SpeedDialAction
          key={mode}
          icon={icon}
          tooltipTitle={mode}
          onClick={() => setSelectionMode({ payload: mode })}
        />
      ))}
    </SpeedDial>
  );
};

export default SelectionModeSelector;
