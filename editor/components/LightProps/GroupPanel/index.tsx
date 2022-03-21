import { Box, List, IconButton, Stack, Button } from "@mui/material";
import { TabPanel } from "@mui/lab";

import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";

import LEDcontrols from "../LEDcontrols";
import OFcontrols from "../OFcontrols";

import type {
  ControlMapStatus,
  LED,
  Fiber,
  PartType,
  PartPayload,
  DancerName,
  Dancers,
} from "core/models";
import { setSelectedParts, setSelectionMode } from "core/actions";
import { notification } from "core/utils";
import { PART } from "constants";

const GroupPanel = ({
  partType,
  groupName,
  dancers,
  parts,
  currentDancers,
  currentStatus,
  colorMap,
  deleteGroup,
}: {
  partType: PartType;
  groupName: string;
  dancers: Dancers;
  parts: string[];
  currentDancers: string[];
  currentStatus: ControlMapStatus;
  colorMap: { [key: string]: string };
  deleteGroup: (groupName: string) => Promise<void>;
}) => {
  const sortedParts = [...parts].sort();

  const handleDelete = async () => {
    try {
      await deleteGroup(groupName);
      notification.success("Succesfully deleted group: " + groupName);
    } catch {
      notification.error(`"${groupName}" is not a group name`);
    }
  };

  // TODO handle edit
  // const handleEdit = () => {  };

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

  const Items: JSX.Element[] = [];
  for (const part of sortedParts) {
    let displayValue: LED | Fiber | number | undefined = undefined;
    for (let dancer of currentDancers) {
      displayValue = currentStatus[dancer]?.[part];
    }
    if (displayValue)
      Items.push(
        partType === "LED" ? (
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
        )
      );
  }

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
        <Stack
          direction="row"
          gap="0.5em"
          justifyContent="space-between"
          my="0.5em"
        >
          <Button onClick={handleSelectAll}>Select all</Button>
          <IconButton children={<DeleteIcon />} onClick={handleDelete} />
          {/* <IconButton children={<EditIcon />} onClick={handleEdit} /> */}
        </Stack>
        <List dense>{Items}</List>
      </TabPanel>
    </Box>
  );
};

export default GroupPanel;
