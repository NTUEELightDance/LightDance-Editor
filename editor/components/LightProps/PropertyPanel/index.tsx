import { Box, List } from "@mui/material";
import { TabPanel } from "@mui/lab";

import OFcontrols from "../OFcontrols";

import {
  DancerName,
  PartName,
  PartType,
  ColorMapType,
} from "../../../core/models";
import LEDcontrols from "../LEDcontrols";

import { ControlMapStatus, LED, Fiber } from "../../../core/models";

const PropertyPanel = ({
  partType,
  value,
  parts,
  currentDancers,
  currentStatus,
  colorMap,
}: {
  partType: PartType;
  value: string;
  parts: PartName[];
  currentDancers: DancerName[];
  currentStatus: ControlMapStatus;
  colorMap: ColorMapType;
}) => {
  const _parts = [...parts].sort();

  return (
    <Box
      sx={{
        ".MuiTabPanel-root": {
          px: "5%",
          py: 0,
        },
      }}
    >
      <TabPanel value={value} key={`property_tabpanel_${partType}`}>
        {currentDancers.length !== 0 && (
          <List dense>
            {_parts.map((part) =>
              partType === "LED" ? (
                <LEDcontrols
                  part={part}
                  currentDancers={currentDancers}
                  displayValue={currentStatus[currentDancers[0]][part] as LED}
                  key={`${currentDancers[0]}_${part}`}
                />
              ) : (
                <OFcontrols
                  part={part}
                  currentDancers={currentDancers}
                  displayValue={currentStatus[currentDancers[0]][part] as Fiber}
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
};

export default PropertyPanel;
