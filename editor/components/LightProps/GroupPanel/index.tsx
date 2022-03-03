import { Box, List, IconButton, Stack, Button } from "@mui/material";
import { TabPanel } from "@mui/lab";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import LEDcontrols from "../LEDcontrols";
import OFcontrols from "../OFcontrols";

import { ControlMapStatus, LED, Fiber, PartType } from "core/models";
import { removeGroup, editGroup } from "core/actions";

const GroupPanel = ({
  partType,
  groupName,
  parts,
  currentDancers,
  currentStatus,
  colorMap,
}: {
  partType: PartType;
  groupName: string;
  parts: string[];
  currentDancers: string[];
  currentStatus: ControlMapStatus;
  colorMap: { [key: string]: string };
}) => {
  parts = parts.sort();

  const handleDelete = () => {
    removeGroup({ payload: groupName });
  };

  // TODO handle edit
  // const handleEdit = () => {  };

  const handleSelectAll = () => {};

  const Items = parts.map((part) => {
    let displayValue: LED | Fiber | number | undefined = undefined;
    for (let dancer of currentDancers) {
      displayValue = currentStatus[dancer]?.[part];
      if (displayValue) break;
    }

    if (!displayValue) return <></>;
    else
      return partType === "LED" ? (
        <LEDcontrols
          part={part}
          currentDancers={currentDancers}
          displayValue={displayValue as LED}
          key={`${currentDancers[0]}_${part}_LED`}
        />
      ) : (
        <OFcontrols
          part={part}
          currentDancers={currentDancers}
          displayValue={displayValue as Fiber}
          key={`${currentDancers[0]}_${part}_OF`}
          colorMap={colorMap}
        />
      );
  });

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
      <TabPanel value={`GROUP_${groupName}`}>
        <Button onClick={handleSelectAll}>Select all</Button>
        <List dense>{Items}</List>
        <Stack
          position="absolute"
          bottom="0.5em"
          direction="row"
          gap="0.5em"
          justifyContent="start"
          width="7em"
        >
          <IconButton children={<DeleteIcon />} onClick={handleDelete} />
          {/* <IconButton children={<EditIcon />} onClick={handleEdit} /> */}
        </Stack>
      </TabPanel>
    </Box>
  );
};

export default GroupPanel;
