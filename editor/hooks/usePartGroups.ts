import { asyncSetItem, asyncGetItem } from "core/utils/";

import { GROUP } from "constants";

import { setPartGroups } from "core/actions";

export default function usePartGroups() {
  const initPartGroups = async () => {
    const storageString = await asyncGetItem(GROUP);
    if (storageString === null) asyncSetItem(GROUP, "{}");
    else
      setPartGroups({
        payload: JSON.parse(storageString),
      });
  };

  return { initPartGroups };
}
