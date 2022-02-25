import { useEffect, useState, useMemo } from "react";

import _ from "lodash";

import { Add as AddIcon } from "@mui/icons-material";

import { Box, Paper, Tab } from "@mui/material";
import { TabContext, TabList } from "@mui/lab";
import PropertyPanel from "./PropertyPanel";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import { getPartType } from "core/utils";
import { PartType } from "core/models";
import useColorMap from "hooks/useColorMap";
import PartGroupPanel from "./PartGroupPanel";

const DancerMode = () => {
  const selected = useReactiveVar(reactiveState.selected);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);
  const dancers = useReactiveVar(reactiveState.dancers);

  const { colorMap } = useColorMap();

  // states for display
  const [displayParts, setDisplayParts] = useState<{
    [key in PartType]?: string[];
  }>({});
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [currentTab, setCurrentTab] = useState<PartType | null>("FIBER");

  // states for current status mutation
  const [currentDancers, setCurrentDancers] = useState<string[]>([]);

  // update parts
  useEffect(() => {
    if (!dancers || !selected) return;

    const selectedDancers: string[] = [];

    Object.entries(selected).forEach(
      ([dancerName, { selected: dancerSelected, parts }]) => {
        if (dancerSelected) selectedDancers.push(dancerName);
      }
    );

    setCurrentDancers(selectedDancers);
    updateDisplayPart(selectedDancers);
  }, [selected]);

  const updateDisplayPart = (selectedDancers: string[]) => {
    if (selectedDancers.length === 0) return;

    // get all intersected parts
    let tempParts: string[] = dancers[selectedDancers[0]];
    selectedDancers.forEach((dancerName) => {
      tempParts = _.intersection(tempParts, dancers[dancerName]);
    });

    // construct new displayPart
    const newDisplayPart: { [key in PartType]?: string[] } = {};

    tempParts.forEach((part) => {
      if (!newDisplayPart[getPartType(part)])
        newDisplayPart[getPartType(part)] = [];

      (newDisplayPart[getPartType(part)] as string[]).push(part);
    });

    // update current tab
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

  const TypeTabs = Object.keys(displayParts).map((partType) => (
    <Tab label={partType} value={partType} key={`property_tab_${partType}`} />
  ));
  const GroupTabs: JSX.Element[] = [];
  const Tabs = [
    ...TypeTabs,
    ...GroupTabs,
    <Tab label={<AddIcon />} value="part_group" key="new_part_group" />,
  ];

  const Panels = useMemo<JSX.Element[]>(
    () =>
      Object.entries(displayParts).map(([partType, parts]) => {
        return (
          <PropertyPanel
            partType={partType as PartType}
            parts={parts as string[]}
            currentDancers={currentDancers}
            currentStatus={currentStatus}
            colorMap={colorMap}
            key={partType as PartType}
          />
        );
      }),
    [displayParts]
  );

  return (
    <TabContext value={currentTab as PartType}>
      <Paper
        sx={{
          width: "100%",
          minHeight: "100%",
          position: "relative",
        }}
        square
      >
        {/* only show tabs when there are more than one tab */}
        {Tabs.length > 0 && (
          <Paper
            sx={{
              position: "sticky",
              top: 0,
              width: "100%",
              height: "3em",
              px: "1em",
              zIndex: 8080,
            }}
            square
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
          </Paper>
        )}
        <Box>{Panels}</Box>
      </Paper>
    </TabContext>
  );
};

export default DancerMode;
