import { useState } from "react";
import { useQuery } from "@apollo/client";
// gql
import { GET_DANCERS } from "../graphql";
// constants
import { useEffect } from "react";

interface DancerParts {
  name: string;
  parts: Part[];
}

interface Part {
  name: string;
  type: PartType;
}

type PartType = "LED" | "FIBER" | "El";

interface DancersType {
  [key: string]: string[]; // dancerName: partNames
}

interface PartTypeMapType {
  [key: string]: PartType;
}

export default function useDancer() {
  // query controlMap
  const { loading, error, data: dancer } = useQuery(GET_DANCERS);
  const [dancerNames, setDancerNames] = useState<string[]>([]);
  const [dancers, setDancers] = useState<DancersType>({});
  const [partTypeMap, setPartTypeMap] = useState<PartTypeMapType>({});

  const getPartType = (partName: string) => {
    return partTypeMap[partName];
  };

  useEffect(() => {
    if (dancer) {
      console.log(dancer);
      const tmpDancerNames: string[] = [];
      const tmpDancers: DancersType = {};
      const tmpPartTypeMap: PartTypeMapType = {};
      (dancer.dancer as DancerParts[]).forEach(
        ({ name: dancerName, parts }) => {
          tmpDancerNames.push(dancerName);
          tmpDancers[dancerName] = [];
          parts.forEach(({ name: partName, type: partType }) => {
            tmpDancers[dancerName].push(partName);
            tmpPartTypeMap[partName] = partType;
          });
        }
      );
      console.log(tmpDancerNames, tmpDancers, tmpPartTypeMap);
      setDancerNames(tmpDancerNames);
      setDancers(tmpDancers);
      setPartTypeMap(tmpPartTypeMap);
    }
  }, [dancer]);

  return {
    loading,
    error,
    dancerNames,
    dancers,
    partTypeMap,
    getPartType,
  };
}
