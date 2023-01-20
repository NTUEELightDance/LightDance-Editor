import { useEffect, useState, useMemo } from "react";

import _ from "lodash";

import { Add as AddIcon } from "@mui/icons-material";

import { Paper, Tab } from "@mui/material";
import { TabContext, TabList } from "@mui/lab";
import PropertyPanel from "./PropertyPanel";
import GroupPanel from "./GroupPanel";
import NewPartGroupPanel from "./NewPartGroupPanel";

import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import { getPartType } from "core/utils";
import type { PartType } from "core/models";

import useColorMap from "hooks/useColorMap";
import usePartGroups from "hooks/usePartGroups";

function DancerMode() {
  const selected = useReactiveVar(reactiveState.selected);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);
  const dancers = useReactiveVar(reactiveState.dancers);

  const { colorMap } = useColorMap();
  const { partGroups, addNewGroup, deleteGroup, editGroup } = usePartGroups();

  // states for display
  const [displayParts, setDisplayParts] = useState<{
    [key in PartType]?: string[];
  }>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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
      if (newDisplayPart[getPartType(part)] == null) {
        newDisplayPart[getPartType(part)] = [];
      }

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

  // to be passed to [groups].filter
  // decide wether we should show this group panel/tab
  // show if any of the seleted dancers has a part that's in the group
  const groupFilter = ([groupName, parts]: [
    groupName: string,
    parts: string[]
  ]) => {
    const displayPartsSet: Set<string> = new Set();

    // put all names of displayed parts in a set for fast .has
    Object.values(displayParts).forEach((displayPartsContent) => {
      displayPartsContent.forEach((part) => displayPartsSet.add(part));
    });

    for (const part of parts) {
      if (displayPartsSet.has(part)) return true;
    }

    return false;
  };

  const Tabs = useMemo<JSX.Element[]>(() => {
    const ret = [
      // type tabs
      ...Object.keys(displayParts).map((partType) => (
        <Tab
          label={partType}
          value={partType}
          key={`property_tab_${partType}`}
        />
      )),
      // group tabs
      ...Object.entries(partGroups)
        .filter(groupFilter)
        .map(([groupName, parts]) => (
          <Tab
            label={groupName}
            value={`GROUP_${groupName}`}
            key={`group_tab_${groupName}`}
          />
        )),
    ];

    if (Object.keys(displayParts).length > 0) {
      ret.push(
        <Tab label={<AddIcon />} value="part_group" key="new_part_group" />
      );
    }
    return ret;
  }, [displayParts, partGroups]);

  const Panels = useMemo<JSX.Element[]>(() => {
    const ret = [
      // type panels
      ...Object.entries(displayParts).map(([partType, parts]) => {
        return (
          <PropertyPanel
            partType={partType as PartType}
            value={partType}
            dancers={dancers}
            parts={parts}
            currentDancers={currentDancers}
            currentStatus={currentStatus}
            colorMap={colorMap}
            key={partType as PartType}
          />
        );
      }),
      // group panels
      ...Object.entries(partGroups)
        .filter(groupFilter)
        .map(([groupName, parts]) => {
          return (
            <GroupPanel
              partType={getPartType(parts[0])}
              groupName={groupName}
              dancers={dancers}
              parts={parts}
              currentDancers={currentDancers}
              currentStatus={currentStatus}
              colorMap={colorMap}
              key={groupName}
              deleteGroup={deleteGroup}
            />
          );
        }),
    ];
    if (Object.keys(displayParts).length > 0) {
      ret.push(
        <NewPartGroupPanel
          displayParts={displayParts}
          key="NEW_PART_GROUP"
          addNewGroup={addNewGroup}
        />
      );
    }
    return ret;
  }, [displayParts, partGroups, currentDancers, currentStatus, colorMap]);

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
              zIndex: 808,
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
        {Panels}
      </Paper>
    </TabContext>
  );
}

export default DancerMode;
