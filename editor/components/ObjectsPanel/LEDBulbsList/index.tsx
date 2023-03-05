import { useEffect, useState } from "react";

import Paper from "@mui/material/Paper";
import TreeView from "@mui/lab/TreeView";
import Button from "@mui/material/Button";

import { reactiveState } from "@/core/state";
import { useReactiveVar } from "@apollo/client";
import LEDBulbsListItem from "./LEDBulbListItem";
import { setSelectedLEDBulbs } from "@/core/actions";

function LEDBulbsList() {
  const selectedLEDs = useReactiveVar(reactiveState.selectedLEDs);
  const currentLEDPartName = useReactiveVar(reactiveState.currentLEDPartName);
  const partLengthMap = useReactiveVar(reactiveState.LEDPartLengthMap);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  useEffect(() => {
    selectedLEDs.forEach((led) => {
      setSelectedNodes((prev) => {
        if (prev.includes(led.toString())) {
          return prev;
        }
        return [...prev, led.toString()];
      });
    });
  }, [currentLEDPartName, selectedLEDs]);

  if (!currentLEDPartName) {
    return null;
  }

  const partLength = partLengthMap[currentLEDPartName];

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setSelectedNodes(nodeIds);
    setSelectedLEDBulbs({ payload: nodeIds.map((id) => parseInt(id)) });
  };

  const handleSelectAll = () => {
    if (selectedNodes.length > 0) {
      setSelectedNodes([]);
      setSelectedLEDBulbs({ payload: [] });
      return;
    }

    setSelectedNodes(
      [...Array(partLength).keys()].map((index) => index.toString())
    );
    setSelectedLEDBulbs({ payload: [...Array(partLength).keys()] });
  };

  return (
    <>
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "0.5em",
          position: "sticky",
          top: "0",
          width: "100%",
          p: "0.5em 0.5em",
          mb: "1em",
          zIndex: 808,
        }}
      >
        <Button onClick={handleSelectAll} fullWidth>
          {selectedNodes.length === 0 ? "Select all" : "Unselect all"}
        </Button>
      </Paper>
      <TreeView
        selected={selectedNodes}
        onNodeSelect={handleSelect}
        multiSelect
      >
        {[...Array(partLength).keys()].map((index) => (
          <LEDBulbsListItem
            key={index}
            label={`LED ${index}`}
            nodeId={index.toString()}
          />
        ))}
      </TreeView>
    </>
  );
}

export default LEDBulbsList;
