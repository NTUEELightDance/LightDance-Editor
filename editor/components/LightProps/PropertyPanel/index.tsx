import { Box, List, ListItemText } from "@mui/material";
import { TabPanel } from "@mui/lab";

import OFcontrols from "../OFcontrols";

import { PartType } from "../../../hooks/useDancer";
import LEDcontrols from "../LEDcontrols";

const PropertyPanel = ({
  partType,
  parts,
}: {
  partType: PartType;
  parts: string[];
}) => {
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
              <LEDcontrols part={part} />
            ) : (
              <OFcontrols part={part} key={part} />
            )
          )}
        </List>
      </TabPanel>
    </Box>
  );
};

export default PropertyPanel;
