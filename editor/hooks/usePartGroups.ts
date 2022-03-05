import { useEffect } from "react";
import { useImmer } from "use-immer";

import { asyncSetItem, asyncGetItem } from "core/utils/";
import {
  DeleteGroupError,
  AddNewGroupError,
  EditGroupError,
} from "core/models";

import { GROUP } from "constants";

export type PartGroupType = {
  [groupName: string]: string[];
};

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
    
    if (partGroups.hasOwnProperty(groupName))
      throw "EXISTED" as AddNewGroupError;
    
    const invalidGroupNames = ["LED", "FIBER", "El", ""];
    if (invalidGroupNames.includes(groupName)) {
      throw "INVALID" as AddNewGroupError;
    }

    setPartGroups((partGroups) => {
      partGroups[groupName] = content;
    });
  };

  const deleteGroup = async (payload: string) => {
    if (!partGroups.hasOwnProperty(payload)) throw "DNE" as AddNewGroupError;

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
    if (!partGroups.hasOwnProperty(groupName)) throw "DNE" as EditGroupError;

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
