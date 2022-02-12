import { useState } from "react";
import { Box, Button } from "@mui/material";
import TreeView from "@mui/lab/TreeView";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { getItem } from "../../core/utils/localStorage";
import DancerTreeItem from "./DancerTreeItem";

const controlMap = JSON.parse(getItem("controlMap") as string);
const dancers = Object.entries((Object.values(controlMap)[0] as any)?.status);
const dancerNames = Object.keys((Object.values(controlMap)[0] as any)?.status);

const DancerTree = () => {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setSelected(nodeIds);
  };

  const handleExpandClick = () => {
    setExpanded((oldExpanded) => (oldExpanded.length === 0 ? dancerNames : []));
  };

  const handleSelectClick = () => {
    setSelected((oldSelected) => (oldSelected.length === 0 ? dancerNames : []));
  };

  return (
    <Box sx={{ width: "100%", backgroundColor: "#151515", px: "5%" }}>
      <Box sx={{ p: 1 }}>
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? "Expand all" : "Collapse all"}
        </Button>
        <Button onClick={handleSelectClick}>
          {selected.length === 0 ? "Select all" : "Unselect all"}
        </Button>
      </Box>
      <TreeView
        aria-label="controlled"
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        multiSelect
      >
        {dancers.map(([name, parts]: [string, any]) => {
          return (
            <DancerTreeItem label={name} nodeId={name}>
              {Object.keys(parts).map((part: string) => (
                <DancerTreeItem label={part} nodeId={`${name}_${part}`} />
              ))}
            </DancerTreeItem>
          );
        })}
      </TreeView>
    </Box>
  );
};

export default DancerTree;
