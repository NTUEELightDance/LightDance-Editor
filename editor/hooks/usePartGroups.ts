import { useEffect } from "react";
import { useImmer } from "use-immer";

import { asyncSetItem, asyncGetItem } from "core/utils";
import { AddNewGroupError, EditGroupError } from "core/models";

import { GROUP } from "@/constants";

export type PartGroupType = Record<string, string[]>;

export default function usePartGroups() {
  const [partGroups, setPartGroups] = useImmer<PartGroupType>({});

  const initPartGroups = async () => {
    const storageString = await asyncGetItem(GROUP);
    if (storageString === null) asyncSetItem(GROUP, "{}");
    else setPartGroups(JSON.parse(storageString));
  };

  const addNewGroup = async ({
    groupName,
    content,
  }: {
    groupName: string;
    content: string[];
  }) => {
    if (content.length === 0) throw "EMPTY" as AddNewGroupError;

    if (partGroups[groupName]) {
      throw "EXISTED" as AddNewGroupError;
    }

    const invalidGroupNames = ["LED", "FIBER", "El", ""];
    if (invalidGroupNames.includes(groupName)) {
      throw "INVALID" as AddNewGroupError;
    }

    setPartGroups((partGroups) => {
      partGroups[groupName] = content;
    });
  };

  const deleteGroup = async (payload: string) => {
    if (!partGroups[payload]) throw "DNE" as AddNewGroupError;

    setPartGroups((partGroups) => {
      delete partGroups[payload];
    });
  };

  const editGroup = async ({
    groupName,
    content,
  }: {
    groupName: string;
    content: string[];
  }) => {
    if (!partGroups[groupName]) throw "DNE" as EditGroupError;

    setPartGroups((partGroups) => {
      partGroups[groupName] = content;
    });
  };

  useEffect(() => {
    initPartGroups();
  }, []);

  useEffect(() => {
    asyncSetItem(GROUP, JSON.stringify(partGroups));
  }, [partGroups]);

  return { partGroups, addNewGroup, deleteGroup, editGroup };
}
