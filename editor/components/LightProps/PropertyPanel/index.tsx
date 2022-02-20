import { Box, List } from "@mui/material";
import { TabPanel } from "@mui/lab";

import OFcontrols from "../OFcontrols";

import { PartType } from "../../../core/models";
import LEDcontrols from "../LEDcontrols";

import { ControlMapStatus, LED, Fiber } from "../../../core/models";

const PropertyPanel = ({
  partType,
  parts,
  currentDancers,
  currentStatus,
}: {
  partType: PartType;
  parts: string[];
  currentDancers: string[];
  currentStatus: ControlMapStatus;
}) => {
  parts = parts.sort();
  return (
    <Box
      sx={{
        ".MuiTabPanel-root": {
          px: "5%",
        },
      }}
    >
      <TabPanel value={partType} key={`property_tabpanel_${partType}`}>
        <List dense>
          {parts.map((part) =>
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
              />
            )
          )}
        </List>
      </TabPanel>
    </Box>
  );
};

export default PropertyPanel;
