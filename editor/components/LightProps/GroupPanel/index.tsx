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
  PartName,
  Dancers,
} from "core/models";
import { setSelectedParts, setSelectionMode } from "core/actions";
import { notification } from "core/utils";
import { PART } from "@/constants";

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
    for (const dancer of currentDancers) {
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
        <Stack direction="row" justifyContent="space-between" my="0.5em">
          <Stack direction="row" gap="0.5em" justifyContent="start">
            {partType === "FIBER" && (
              <Button onClick={handleSelectAll}>Select All</Button>
            )}
            <Button onClick={handleRandom}>Random</Button>
          </Stack>
          <IconButton
            children={<DeleteIcon fontSize="small" />}
            onClick={handleDelete}
          />
          {/* <IconButton children={<EditIcon />} onClick={handleEdit} /> */}
        </Stack>
        <List dense>{Items}</List>
      </TabPanel>
    </Box>
  );
};

export default GroupPanel;
