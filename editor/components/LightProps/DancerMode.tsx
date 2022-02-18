import { useEffect, useState, useMemo } from "react";

import _ from "lodash";

import { Box, Paper, Tab } from "@mui/material";
import { TabContext, TabList } from "@mui/lab";
import PropertyPanel from "./PropertyPanel";

import useDancer, { PartType } from "../../hooks/useDancer";

import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";

const DancerMode = () => {
  const selected = useReactiveVar(reactiveState.selected);
  const { dancers, getPartType } = useDancer();

  // states for display
  const [displayParts, setDisplayParts] = useState<{
    [key in PartType]?: string[];
  }>({});
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [currentTab, setCurrentTab] = useState<PartType | null>("FIBER");
  const [currentDancers, setCurrentDancers] = useState<string[]>([]);

  // update parts
  useEffect(() => {
    if (!dancers || !getPartType || !selected) return;

    const selectedDancers: string[] = [];

    Object.entries(selected).forEach(
      ([dancerName, { selected: dancerSelected, parts }]) => {
        if (dancerSelected) selectedDancers.push(dancerName);
      }
    );

    updateDisplayPart(selectedDancers);
  }, [selected]);

  const updateDisplayPart = (selectedDancers: string[]) => {
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

  const Panels = useMemo<JSX.Element[]>(
    () =>
      Object.entries(displayParts).map(([partType, parts]) => {
        return <PropertyPanel partType={partType as PartType} parts={parts} />;
      }),
    [displayParts]
  );

  return (
    <Paper sx={{ width: "100%", minHeight: "100%", position: "relative" }}>
      <TabContext value={currentTab as PartType}>
        {/* only show tabs when there are more than one tab */}
        {Tabs.length > 0 && (
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: "1em",
              position: "fixed",
              width: "100%",
              backgroundColor: "#202020",
              zIndex: 8080,
            }}
          >
            <TabList
              onChange={handleChangeTab}
              sx={{
                minHeight: "2em",
                "button.MuiTab-root.MuiButtonBase-root": {
                  padding: "0.5em 0.5em",
                  minWidth: "4em",
                  minHeight: "2em",
                },
              }}
            >
              {Tabs}
            </TabList>
          </Box>
        )}
        <Box
          sx={{
            pt: "1em",
          }}
        >
          {Panels}
        </Box>
      </TabContext>
    </Paper>
  );
};

export default DancerMode;
