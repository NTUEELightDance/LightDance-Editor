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
import NewPartGroupPanel from "./NewPartGroupPanel";

const DancerMode = () => {
  const selected = useReactiveVar(reactiveState.selected);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);
  const dancers = useReactiveVar(reactiveState.dancers);
  const partGroups = useReactiveVar(reactiveState.partGroups);

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
  const GroupTabs = Object.keys(partGroups).map((groupName) => (
    <Tab
      label={groupName}
      value={`GROUP_${groupName}`}
      key={`group_tab_${groupName}`}
    />
  ));
  const Tabs = [...TypeTabs, ...GroupTabs];
  if (Object.keys(displayParts).length > 0) {
    Tabs.push(
      <Tab label={<AddIcon />} value="part_group" key="new_part_group" />
    );
  }

  const TypePanels = useMemo<JSX.Element[]>(
    () =>
      Object.entries(displayParts).map(([partType, parts]) => {
        return (
          <PropertyPanel
            partType={partType as PartType}
            value={partType}
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
  const GroupPanels = useMemo<JSX.Element[]>(
    () =>
      Object.entries(partGroups)
        .filter(() => {}) // to decide wether we should show this group panel
        .map(([groupName, parts]) => {
          return (
            <PropertyPanel
              partType={getPartType(parts[0])}
              value={`GROUP_${groupName}`}
              parts={parts as string[]}
              currentDancers={currentDancers}
              currentStatus={currentStatus}
              colorMap={colorMap}
              key={groupName}
            />
          );
        }),
    [displayParts]
  );
  const Panels = [
    ...TypePanels,
    ...GroupPanels,
    <NewPartGroupPanel displayParts={displayParts} key="NEW_PART_GROUP" />,
  ];

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
