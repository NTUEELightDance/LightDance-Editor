import { useEffect, useState } from "react";

import _ from "lodash";

import { Box, Paper, Tab } from "@mui/material";
import { TabContext, TabList } from "@mui/lab";
import PropertyPanel from "./PropertyPanel";

import useDancer, { PartType } from "../../hooks/useDancer";

import { PartPayloadType } from "../../core/models";
import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";
import { DANCER, PART, POSITION } from "constants";

const LightProps = () => {
  const selected = useReactiveVar(reactiveState.selected);
  const selectionMode = useReactiveVar(reactiveState.selectionMode);
  const { dancers, getPartType } = useDancer();

  // states for display
  const [displayParts, setDisplayParts] = useState<{
    [key in PartType]?: string[];
  }>({});
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [currentTab, setCurrentTab] = useState<PartType | null>("LED");
  const [currentDancers, setCurrentDancers] = useState<string[]>([]);

  // update parts
  useEffect(() => {
    if (!dancers || !getPartType || !selected) return;

    const selectedParts: PartPayloadType = {};
    const selectedDancers: string[] = [];

    switch (selectionMode) {
      case DANCER:
        Object.entries(selected).forEach(
          ([dancerName, { selected: dancerSelected, parts }]) => {
            if (dancerSelected) selectedDancers.push(dancerName);
          }
        );
        updateDisplayPart({ selectedDancers });
        break;

      case PART:
        Object.entries(selected).forEach(
          ([dancerName, { selected: dancerSelected, parts }]) => {
            if (parts.length > 0) selectedParts[dancerName] = parts;
          }
        );
        updateDisplayPart({ selectedParts });
        break;

      case POSITION:
        break;

      default:
        break;
    }
  }, [selected]);

  const updateDisplayPart = ({
    selectedDancers,
    selectedParts,
  }: {
    selectedDancers?: string[];
    selectedParts?: PartPayloadType;
  }) => {
    if (selectedDancers) {
      // get all intersected parts
      let tempParts: string[] = [];
      selectedDancers.forEach((dancerName) => {
        const parts = dancers[dancerName];
        if (tempParts.length === 0) tempParts = parts;
        tempParts = _.intersection(tempParts, parts);
      });

      // construct new displayPart
      const newDisplayPart: { [key in PartType]?: string[] } = {};

      tempParts.forEach((part) => {
        if (!newDisplayPart[getPartType(part)])
          newDisplayPart[getPartType(part)] = [];

        (newDisplayPart[getPartType(part)] as string[]).push(part);
      });

      if (!Object.keys(newDisplayPart).includes(currentTab as PartType)) {
        const newTab = Object.keys(newDisplayPart)[0] as PartType;
        newTab && setCurrentTab(newTab);
      }

      setDisplayParts(newDisplayPart);
    } else if (selectedParts) {
    }
  };

  const toggleExpand = (part: string) => () => {
    setExpanded((expanded) => {
      expanded[part] = expanded[part];
      return expanded;
    });
  };

  const handleChangeTab = (event: React.SyntheticEvent, newTab: PartType) => {
    setCurrentTab(newTab);
  };

  const Tabs = Object.keys(displayParts).map((partType) => (
    <Tab label={partType} value={partType} key={`property_tab_${partType}`} />
  ));

  return (
    <Paper sx={{ width: "100%", minHeight: "100%" }}>
      <TabContext value={currentTab as PartType}>
        {/* only show tabs when there are more than one tab */}
        {Tabs.length > 1 && (
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChangeTab}>{Tabs}</TabList>
          </Box>
        )}
        {Object.entries(displayParts).map(([partType, parts]) => (
          <PropertyPanel partType={partType as PartType} parts={parts} />
        ))}
      </TabContext>
    </Paper>
  );
};

export default LightProps;
