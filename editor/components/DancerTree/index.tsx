import { useEffect, useState } from "react";

import { Button, Paper } from "@mui/material";

import DancerTreeContent from "./DancerTreeContent";

import { setSelectionMode } from "core/actions";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

const DancerTree = () => {
  const dancers = useReactiveVar(reactiveState.dancers);
  const dancerNames = useReactiveVar(reactiveState.dancerNames);
  const selected = useReactiveVar(reactiveState.selected);

  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // update selected nodes based on the global selected state
  useEffect(() => {
    const newNodeIds: string[] = [];
    Object.entries(selected).forEach(
      ([name, { selected: dancerSelected, parts }]) => {
        dancerSelected && newNodeIds.push(name);
        parts.forEach((part) => newNodeIds.push(`${name}%${part}`));
      }
    );
    setSelectedNodes(newNodeIds);
  }, [selected]);

  // handle expand/collapse all
  const handleExpandClick = () => {
    setExpanded((oldExpanded) => (oldExpanded.length === 0 ? dancerNames : []));
  };

  // handle select/unselect all
  const handleSelectClick = () => {
    setSelectedNodes((oldSelected) =>
      oldSelected.length === 0 ? dancerNames : []
    );
  };

  return (
    <Paper
      sx={{ width: "100%", px: "5%", minHeight: "100%", position: "relative" }}
      square
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "0.3em",
          position: "sticky",
          top: "0.5em",
          mb: "1em",
          p: "0.3em",
          width: "100%",
          zIndex: 80,
        }}
      >
        <Button onClick={handleExpandClick} fullWidth>
          {expanded.length === 0 ? "Expand all" : "Collapse all"}
        </Button>
        <Button onClick={handleSelectClick} fullWidth>
          {selectedNodes.length === 0 ? "Select all" : "Unselect all"}
        </Button>
      </Paper>
      <DancerTreeContent
        dancers={dancers}
        dancerNames={dancerNames}
        expanded={expanded}
        setExpanded={setExpanded}
        selectedNodes={selectedNodes}
        setSelectedNodes={setSelectedNodes}
      />
    </Paper>
  );
};

export default DancerTree;
