import { useState } from "react";
import { useQuery } from "@apollo/client";
// gql
import { GET_DANCERS } from "../graphql";
// constants
import { useEffect } from "react";
// states and actions
import { reactiveState } from "core/state";
import { setDancerNames, setDancers, setPartTypeMap } from "core/actions";
import { useReactiveVar } from "@apollo/client";
// models
import { DancersType, PartTypeMapType, DancerParts } from "core/models";

import _ from "lodash";

interface DancerParts {
  name: string;
  parts: Part[];
}

interface Part {
  name: string;
  type: PartType;
}

export type PartType = "LED" | "FIBER" | "El";

interface DancersType {
  [key: string]: string[]; // dancerName: partNames
}

interface PartTypeMapType {
  [key: string]: PartType;
}

export default function useDancer() {
  // query controlMap
  const { loading, error, data: dancer } = useQuery(GET_DANCERS);
  const dancerNames = useReactiveVar(reactiveState.dancerNames);
  const dancers = useReactiveVar(reactiveState.dancers);
  const partTypeMap = useReactiveVar(reactiveState.partTypeMap);

  useEffect(() => {
    if (dancer) {
      const tmpDancerNames: string[] = [];
      const tmpDancers: DancersType = {};
      const tmpPartTypeMap: PartTypeMapType = {};
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
    }
  }, [dancer]);

  return {
    loading,
    error,
    dancerNames,
    dancers,
    partTypeMap,
  };
}
