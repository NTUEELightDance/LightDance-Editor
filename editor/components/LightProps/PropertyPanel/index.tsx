import { Box, List, Stack, Button } from "@mui/material";
import { TabPanel } from "@mui/lab";

import OFcontrols from "../OFcontrols";

import type {
  Dancers,
  DancerName,
  PartName,
  PartType,
  ColorMap,
  ControlMapStatus,
  LEDData,
  FiberData,
  PartPayload,
} from "core/models";
import { setSelectedParts, setSelectionMode } from "core/actions";

import LEDcontrols from "../LEDcontrols";

import { PART } from "@/constants";

function PropertyPanel({
  partType,
  value,
  dancers,
  parts,
  currentDancers,
  currentStatus,
  colorMap,
}: {
  partType: PartType;
  value: string;
  dancers: Dancers;
  parts: PartName[];
  currentDancers: DancerName[];
  currentStatus: ControlMapStatus;
  colorMap: ColorMap;
}) {
  const sortedParts = [...parts].sort();

  const handleSelectAll = () => {
    const newSelectedParts: PartPayload = {};
    currentDancers.forEach((dancerName) => {
      newSelectedParts[dancerName] = sortedParts.filter((part) =>
        dancers[dancerName].includes(part)
      );
    });
    setSelectedParts({ payload: newSelectedParts });
    setSelectionMode({ payload: PART });
  };

  const handleRandom = () => {
    const newSelectedParts: PartPayload = {};
    const randomParts: PartName[] = [];
    const randomCount = Math.floor(
      (Math.random() * 0.4 + 0.3) * sortedParts.length
    );
    for (let i = 0; i < randomCount; i++) {
      randomParts.push(
        sortedParts[Math.floor(Math.random() * sortedParts.length)]
      );
    }
    currentDancers.forEach((dancerName) => {
      newSelectedParts[dancerName] = randomParts;
    });
    setSelectedParts({ payload: newSelectedParts });
    setSelectionMode({ payload: PART });
  };

  return (
    <Box
      sx={{
        ".MuiTabPanel-root": {
          height: "100%",
          width: "100%",
          px: "5%",
          py: 0,
        },
      }}
    >
      <TabPanel value={value}>
        {sortedParts.length > 0 && (
          <Stack direction="row" gap="0.5em" justifyContent="start" my="0.5em">
            {partType === "FIBER" && (
              <Button onClick={handleSelectAll}>Select All</Button>
            )}
            <Button onClick={handleRandom}>Random</Button>
          </Stack>
        )}
        {currentDancers.length !== 0 && (
          <List dense>
            {sortedParts.map((part) =>
              partType === "LED" ? (
                <LEDcontrols
                  part={part}
                  currentDancers={currentDancers}
                  displayValue={currentStatus[currentDancers[0]][part] as LEDData}
                  key={`${currentDancers[0]}_${part}`}
                />
              ) : (
                <OFcontrols
                  part={part}
                  currentDancers={currentDancers}
                  displayValue={currentStatus[currentDancers[0]][part] as FiberData}
                  key={`${currentDancers[0]}_${part}`}
                  colorMap={colorMap}
                />
              )
            )}
          </List>
        )}
      </TabPanel>
    </Box>
  );
}

export default PropertyPanel;
