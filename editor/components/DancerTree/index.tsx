import { useEffect, useState } from "react";

import TreeView from "@mui/lab/TreeView";
import { Box, Button } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import DancerTreeItem from "./DancerTreeItem";

import { setSelectedDancers, setSelectedParts } from "../../core/actions";
import { PartPayloadType } from "../../core/models";
import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";

import useDancer from "hooks/useDancer";

const DancerTree = () => {
  const { dancers, dancerNames } = useDancer();

  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const selected = useReactiveVar(reactiveState.selected);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    const newSelectedDancers: Set<string> = new Set();
    let newSelectedParts: PartPayloadType = {};

    nodeIds.forEach((nodeId) => {
      const nodeIdArray = nodeId.split("%");
      if (nodeIdArray.length === 1) {
        newSelectedDancers.add(nodeIdArray[0]);
      } else {
        if (!newSelectedParts.hasOwnProperty(nodeIdArray[0])) {
          newSelectedParts[nodeIdArray[0]] = [];
        }
        newSelectedParts[nodeIdArray[0]].push(nodeIdArray[1]);
      }
    });

    // broadcast mode
    if (
      newSelectedDancers.size > 0 &&
      Object.keys(newSelectedParts).length > 0
    ) {
      const broadcastedPartsSet: Set<string> = new Set();
      Object.entries(newSelectedParts).forEach(([dancer, parts]) => {
        newSelectedDancers.add(dancer);
        parts.forEach((part) => broadcastedPartsSet.add(part));
      });
      newSelectedDancers.forEach((dancerName) => {
        dancers[dancerName].forEach((part) => {
          if (broadcastedPartsSet.has(part)) {
            if (!newSelectedParts.hasOwnProperty(dancerName)) {
              newSelectedParts[dancerName] = [];
            }
            newSelectedParts[dancerName].push(part);
          }
        });
      });
    }

    setSelectedDancers({ payload: [...newSelectedDancers] });
    setSelectedParts({ payload: newSelectedParts });
  };

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

  const handleExpandClick = () => {
    setExpanded((oldExpanded) => (oldExpanded.length === 0 ? dancerNames : []));
  };

  const handleSelectClick = () => {
    setSelectedNodes((oldSelected) =>
      oldSelected.length === 0 ? dancerNames : []
    );
  };

  return (
    <Box sx={{ width: "100%", backgroundColor: "#151515", px: "5%" }}>
      <Box sx={{ p: 1 }}>
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? "Expand all" : "Collapse all"}
        </Button>
        <Button onClick={handleSelectClick}>
          {selectedNodes.length === 0 ? "Select all" : "Unselect all"}
        </Button>
      </Box>
      <TreeView
        aria-label="controlled"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selectedNodes}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        multiSelect
      >
        {Object.entries(dancers).map(([name, parts]: [string, any]) => {
          return (
            <DancerTreeItem key={`DANCER_${name}`} label={name} nodeId={name}>
              {parts.map((part: string) => (
                <DancerTreeItem
                  key={`PART_${name}_${part}`}
                  label={part}
                  nodeId={`${name}%${part}`}
                  sx={{
                    "p.MuiTreeItem-label": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              ))}
            </DancerTreeItem>
          );
        })}
      </TreeView>
    </Box>
  );
};

export default DancerTree;
