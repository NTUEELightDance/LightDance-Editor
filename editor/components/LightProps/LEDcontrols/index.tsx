import { useState } from "react";
import { useReactiveVar } from "@apollo/client";
// components
import { Box, Typography, ListItemButton, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import LEDcontrolsContents from "./LEDcontrolsContent";
// core
import type { LEDData, LEDPartName } from "@/core/models";
import { editCurrentStatusLED } from "@/core/actions";
import { reactiveState } from "@/core/state";

function LEDcontrols({
  part,
  currentDancers,
  currentLEDData,
}: {
  part: LEDPartName;
  currentDancers: string[];
  currentLEDData: LEDData;
}) {
  const LEDEffectIDTable = useReactiveVar(reactiveState.LEDEffectIDtable);
  // Call core actions to update currentStatus
  const updateCurrentStatus = ({
    src,
    alpha,
  }: {
    src?: string;
    alpha?: number;
  }) => {
    // src can be empty string, alpha can be zero
    // so check for undefined only
    if (src === undefined && alpha === undefined) return;

    const payload = currentDancers.map((dancerName) => {
      if (src !== undefined) {
        const effectID = reactiveState.ledMap()[part][src]?.effectID;
        return {
          dancerName,
          partName: part,
          value: {
            effectID: effectID ?? -1,
            ...(alpha !== undefined && { alpha }),
          },
        };
      }

      return {
        dancerName,
        partName: part,
        value: {
          alpha,
        },
      };
    });
    editCurrentStatusLED({ payload });
  };

  const handleSrcChange = (src: string) => {
    updateCurrentStatus({ src });
  };

  const handleIntensityChange = (alpha: number) => {
    updateCurrentStatus({ alpha });
  };

  // UI
  const [open, setOpen] = useState<boolean>(false);

  const handleExpand = () => {
    setOpen(!open);
  };

  const valueLabelFormat = (value: number) => {
    return value === 15 ? "flash" : value;
  };

  return (
    <>
      <ListItemButton onClick={handleExpand}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box sx={{ width: "10vw" }}>
            <Typography>{part}</Typography>
          </Box>
          <Box sx={{ width: "3vw" }}>
            <Typography>{valueLabelFormat(currentLEDData.alpha)}</Typography>
          </Box>
          <div>{open ? <ExpandLess /> : <ExpandMore />}</div>
        </Box>
      </ListItemButton>

      <Collapse in={open} timeout="auto" mountOnEnter unmountOnExit>
        <LEDcontrolsContents
          parts={[part as LEDPartName]}
          intensity={currentLEDData.alpha}
          src={LEDEffectIDTable[currentLEDData.effectID].name}
          handleIntensityChange={handleIntensityChange}
          handleSrcChange={handleSrcChange}
          oneLine
        />
      </Collapse>
    </>
  );
}
export default LEDcontrols;
