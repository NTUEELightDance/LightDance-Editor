import { useState } from "react";

import { Box } from "@mui/material";
import { TabPanel } from "@mui/lab";

import DancerTreeContent from "components/DancerTree/DancerTreeContent";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import { getItem, setItem } from "core/utils";

const PartGroupPanel = () => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const dancers = useReactiveVar(reactiveState.dancers);
  const dancerNames = useReactiveVar(reactiveState.dancerNames);

  return (
    <Box
      sx={{
        ".MuiTabPanel-root": {
          px: "5%",
          py: 0,
        },
      }}
    >
      <TabPanel value="part_group">
        <DancerTreeContent
          dancers={dancers}
          dancerNames={dancerNames}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
        />
      </TabPanel>
    </Box>
  );
};

export default PartGroupPanel;
