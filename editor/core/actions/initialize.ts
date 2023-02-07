import { registerActions } from "../registerActions";
// types
import type {
  State,
  Dancers,
  PartTypeMap,
  DancerName,
  ControlMap,
  ControlMapStatus,
  DancerStatus,
  PosMap,
  Coordinates,
  PosMapStatus,
} from "../models";

import { dancerAgent, controlAgent, posAgent } from "@/api";

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

    const partTypeMap: PartTypeMap = {};
    dancersData.forEach((dancer) => {
      dancer.parts.forEach((part) => {
        partTypeMap[part.name] = part.type;
      });
    });

    state.dancerNames = dancerNames;
    state.dancers = dancers;
    state.partTypeMap = partTypeMap;
    state.dancersArray = dancersData;
  },

  // depends on initDancers
  initCurrentStatus: async (state: State) => {
    const controlMapPayload = await controlAgent.getControlMap();

    // convert controlMap
    const controlMap: ControlMap = {};
    Object.entries(controlMapPayload).forEach(([id, frame]) => {
      const { fade, start, status: statusPayload } = frame;
      const status: ControlMapStatus = {};

      statusPayload.forEach((dancerStatusPayload, dancerIndex) => {
        const dancerName = state.dancersArray[dancerIndex].name;
        const dancerStatus: DancerStatus = {};

        dancerStatusPayload.forEach((partStatusPayload, partIndex) => {
          const partName =
            state.dancersArray[dancerIndex].parts[partIndex].name;
          const partType = state.partTypeMap[partName];

          if (partType === "LED") {
            const [src, alpha] = partStatusPayload;
            dancerStatus[partName] = {
              src,
              alpha,
            };
          } else if (partType === "FIBER") {
            const [color, alpha] = partStatusPayload;
            dancerStatus[partName] = {
              color,
              alpha,
            };
          }
        });

        status[dancerName] = dancerStatus;
      });

      controlMap[id] = {
        fade,
        start,
        status,
      };
    });

    const controlRecord = await controlAgent.getControlRecord();

    state.currentStatus = controlMap[controlRecord[0]].status;
  },

  initCurrentPos: async (state: State) => {
    const posMapPayload = await posAgent.getPosMap();

    // convert posMap
    const posMap: PosMap = {};
    Object.entries(posMapPayload).forEach(([id, frame]) => {
      const { start, pos: posPayload } = frame;

      const pos: PosMapStatus = {};
      posPayload.forEach((coordinatesPayload, dancerIndex) => {
        const dancerName = state.dancersArray[dancerIndex].name;
        const coordinates: Coordinates = {
          x: coordinatesPayload[0],
          y: coordinatesPayload[1],
          z: coordinatesPayload[2],
        };

        pos[dancerName] = coordinates;
      });

      posMap[id] = {
        start,
        pos,
      };
    });

    const posRecord = await posAgent.getPosRecord();

    state.currentPos = posMap[posRecord[0]].pos;
  },
});

export const { initDancers, initCurrentStatus, initCurrentPos } = actions;
