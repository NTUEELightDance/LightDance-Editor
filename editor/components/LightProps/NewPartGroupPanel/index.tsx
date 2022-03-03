import { useState, ChangeEventHandler } from "react";

import {
  Box,
  Stack,
  TextField,
  Typography,
  Button,
  FormControl,
} from "@mui/material";
import { TabPanel, TreeView, TreeItem } from "@mui/lab";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

import { notification, getPartType } from "core/utils";
import { addNewGroup } from "core/actions";

const NewPartGroupPanel = ({
  displayParts,
}: {
  displayParts: { [key: string]: string[] };
}) => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  const [newGroupName, setNewGroupName] = useState<string>("");

  const handleInputChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => setNewGroupName(e.target.value);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setSelectedNodes(
      nodeIds.filter((nodeId) => nodeId != "LED" && nodeId != "FIBER")
    );
  };

  const handleCancel = () => {
    setNewGroupName("");
    setSelectedNodes([]);
  };

  const handleConfirm = () => {
    const invalidGroupNames = ["LED", "FIBER", "El", ""];
    if (invalidGroupNames.includes(newGroupName)) {
      notification.error("Invalid group name");
      return;
    }

    if (selectedNodes.length === 0) {
      notification.error("Group member is empty");
      return;
    }

    try {
      addNewGroup({
        payload: { groupName: newGroupName, content: selectedNodes },
      });
    } catch {
      notification.error("Group name already existed");
    }

    const assertPartType = getPartType(selectedNodes[0]);
    for (const nodeId in selectedNodes) {
      if (getPartType(nodeId) !== assertPartType) {
        notification.error(
          "Invalid group: the group contains more than one type of part"
        );
        return;
      }
    }

    handleCancel();
    notification.success(`Successfully added group: ${newGroupName}`);
  };

  return (
    <Box
      sx={{
        ".MuiTabPanel-root": {
          py: "1em",
        },
      }}
    >
      <TabPanel value="part_group">
        <Stack gap="1em">
          <Box>
            <Typography variant="h6">Group name</Typography>
            <Stack direction="column" alignItems="center">
              <FormControl required>
                <TextField
                  margin="dense"
                  label="Group Name"
                  variant="filled"
                  value={newGroupName}
                  onChange={handleInputChange}
                  size="small"
                />
              </FormControl>
            </Stack>
          </Box>
          <Box>
            <Typography variant="h6">Parts</Typography>

            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              expanded={expanded}
              selected={selectedNodes}
              onNodeToggle={handleToggle}
              onNodeSelect={handleSelect}
              multiSelect
            >
              {Object.entries(displayParts).map(([type, parts]) => (
                <TreeItem label={type} nodeId={type} key={type}>
                  {parts.map((part) => (
                    <TreeItem
                      label={part}
                      nodeId={part}
                      key={`${type}_${part}`}
                    />
                  ))}
                </TreeItem>
              ))}
            </TreeView>
          </Box>
          <Stack direction="row" justifyContent="end" gap="0.5em">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </Stack>
        </Stack>
      </TabPanel>
    </Box>
  );
};

export default NewPartGroupPanel;
