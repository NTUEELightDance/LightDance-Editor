import { useQuery } from "@apollo/client";
// gql
import { GET_DANCERS } from "../graphql";
// constants
import { useState, useEffect } from "react";
// states and actions
import { reactiveState } from "core/state";
import { setDancerNames, setDancers, setPartTypeMap } from "core/actions";
import { useReactiveVar } from "@apollo/client";
// models
import { Dancers, PartTypeMap, DancerParts } from "core/models";

import _ from "lodash";

export default function useDancer() {
  // query controlMap
  const { loading: dancerLoading, error, data: dancer } = useQuery(GET_DANCERS);
  const dancerNames = useReactiveVar(reactiveState.dancerNames);
  const dancers = useReactiveVar(reactiveState.dancers);
  const partTypeMap = useReactiveVar(reactiveState.partTypeMap);

  // loading will be set after loading the dancer info to the state registry
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dancerLoading && dancer) {
      const tmpDancerNames: string[] = [];
      const tmpDancers: Dancers = {};
      const tmpPartTypeMap: PartTypeMap = {};
      const sortedDancers: DancerParts[] = _.sortBy(dancer.dancer, (dancer) =>
        Number(dancer.name.split("_")[0])
      );
      sortedDancers.forEach(({ name: dancerName, parts }) => {
        tmpDancerNames.push(dancerName);
        tmpDancers[dancerName] = [];
        parts.forEach(({ name: partName, type: partType }) => {
          tmpDancers[dancerName].push(partName);
          tmpPartTypeMap[partName] = partType;
        });
      });
      setDancerNames({ payload: tmpDancerNames });
      setDancers({ payload: tmpDancers });
      setPartTypeMap({ payload: tmpPartTypeMap });
      setLoading(false);
    }
  }, [dancerLoading, dancer]);

  return {
    loading,
    error,
    dancerNames,
    dancers,
    partTypeMap,
  };
}
