import { registerActions } from "../registerActions";
// types
import type { State, Dancers, PartTypeMap, DancerName } from "../models";

import { dancerAgent } from "@/api/dancerAgent";

const actions = registerActions({
  initDancers: async (state: State) => {
    const dancersData = await dancerAgent.getDancers();
    if (!dancersData) {
      return;
    }

    const dancerNames: DancerName[] = dancersData.map((dancer) => dancer.name);
    const dancers = dancersData.reduce(
      (acc, dancer) => ({
        ...acc,
        [dancer.name]: dancer.parts.map((part) => part.name),
      }),
      {} as Dancers
    );
    const partTypeMap = dancersData.reduce(
      (acc, dancer) => ({
        ...acc,
        ...dancer.parts.reduce(
          (acc, part) => ({
            ...acc,
            [part.name]: part.type,
          }),
          {} as PartTypeMap
        ),
      }),
      {} as PartTypeMap
    );

    state.dancerNames = dancerNames;
    state.dancers = dancers;
    state.partTypeMap = partTypeMap;
  },
});

export const { initDancers } = actions;
