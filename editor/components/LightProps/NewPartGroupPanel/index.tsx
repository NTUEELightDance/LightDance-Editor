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

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
import { PartGroupType } from "core/models";
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
    if (invalidGroupNames.includes(newGroupName) || selectedNodes.length === 0)
      return;

    addNewGroup({
      payload: { groupName: newGroupName, content: selectedNodes },
    });
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
                  defaultValue="New Group"
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
