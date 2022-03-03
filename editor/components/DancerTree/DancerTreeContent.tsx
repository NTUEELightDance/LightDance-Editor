import { useState } from "react";

import TreeView from "@mui/lab/TreeView";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import DancerTreeItem from "./DancerTreeItem";

import { setSelectedDancers, setSelectedParts } from "core/actions";
import { PartPayloadType, DancersType } from "core/models";

const DancerTreeContent = ({
  dancers,
  dancerNames,
  expanded,
  setExpanded,
  selectedNodes,
  setSelectedNodes,
}: {
  dancers: DancersType;
  dancerNames: string[];
  expanded: string[];
  setExpanded: React.Dispatch<React.SetStateAction<string[]>>;
  selectedNodes: string[];
  setSelectedNodes: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
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
  );
};

export default DancerTreeContent;
