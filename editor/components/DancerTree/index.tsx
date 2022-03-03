import { useEffect, useState } from "react";

import TreeView from "@mui/lab/TreeView";
import { Button, Paper } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import DancerTreeItem from "./DancerTreeItem";

import {
  setSelectedDancers,
  setSelectedParts,
  setSelectionMode,
} from "../../core/actions";
import { PartPayloadType, SelectionModeType } from "../../core/models";
import { DANCER, PART, POSITION } from "../../constants";
import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";

const DancerTree = () => {
  const dancers = useReactiveVar(reactiveState.dancers);
  const dancerNames = useReactiveVar(reactiveState.dancerNames);
  const selected = useReactiveVar(reactiveState.selected);
  const selectionMode = useReactiveVar(reactiveState.selectionMode);

  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    const newSelectedDancers: Set<string> = new Set();
    let newSelectedParts: PartPayloadType = {};
    let newSelectionMode: SelectionModeType | null = null;

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

    if (newSelectedDancers.size > 0) newSelectionMode = DANCER;
    if (Object.keys(newSelectedParts).length > 0) newSelectionMode = PART;

    if (
      newSelectedDancers.size > 0 &&
      Object.keys(newSelectedParts).length > 0
    ) {
      // broadcast mode
      const broadcastedPartsSet: Set<string> = new Set();
      // get all part names and dancer names to be broadcasted
      Object.entries(newSelectedParts).forEach(([dancer, parts]) => {
        newSelectedDancers.add(dancer);
        parts.forEach((part) => broadcastedPartsSet.add(part));
      });
      // iterate through new selected dancers,
      // if the dancer has a part in broadcastedPartsSet, select it
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

    if (selectionMode !== POSITION)
      setSelectionMode({ payload: newSelectionMode });
  };

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

  const nodeSortFunction = (a: string, b: string) => {
    const aList: string[] = a.split("_");
    const bList: string[] = b.split("_");
    if (
      aList[aList.length - 1] === bList[aList.length - 1] &&
      aList[aList.length - 1] === "LED"
    )
      return a < b ? -1 : a > b ? 1 : 0;
    if (aList[aList.length - 1] === "LED") return 1;
    if (bList[bList.length - 1] === "LED") return -1;
    return a < b ? -1 : a > b ? 1 : 0;
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
          gap: "0.5em",
          position: "sticky",
          top: 0,
          width: "100%",
          p: "0.5em 0.5em",
          mb: "1em",
          zIndex: 8080,
        }}
      >
        <Button onClick={handleExpandClick} fullWidth>
          {expanded.length === 0 ? "Expand all" : "Collapse all"}
        </Button>
        <Button onClick={handleSelectClick} fullWidth>
          {selectedNodes.length === 0 ? "Select all" : "Unselect all"}
        </Button>
      </Paper>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selectedNodes}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        multiSelect
      >
        {Object.entries(dancers).map(([name, parts]: [string, any]) => (
          <DancerTreeItem key={`DANCER_${name}`} label={name} nodeId={name}>
            {parts.sort(nodeSortFunction).map((part: string) => (
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
        ))}
      </TreeView>
    </Paper>
  );
};

export default DancerTree;
