import { registerActions } from "../registerActions";
// types
import {
  State,
  ControlMapStatus,
  LedEffectRecord,
  DancerName,
  DancerStatus,
  LEDData,
  LEDMap,
} from "../models";
// utils
import { getControl } from "../utils";
import { LED as LED_TYPE, NO_EFFECT } from "@/constants";

const actions = registerActions({
  setLEDMap: async (state: State, payload: LEDMap) => {
    state.ledMap = payload;
  },

  /**
   * Generate LedEffectRecord
   * According to dancers, controlMap and controlRecord
   * stripped out NO_EFFECT source
   * @param state
   */
  generateLedEffectRecord: async (state: State) => {
    const [controlMap, controlRecord] = await getControl();
    const { dancers, partTypeMap } = state;

    const ledEffectRecord: LedEffectRecord = {};

    // initialize the ledEffectRecord
    Object.entries(dancers).map(([dancerName, parts]) => {
      ledEffectRecord[dancerName] = {};
      parts.forEach((partName) => {
        if (partTypeMap[partName] === LED_TYPE) {
          ledEffectRecord[dancerName][partName] = [];
        }
      });
    });

    // go through control record, add the index if the led source is NOT NO_EFFECT
    controlRecord.forEach((id: string) => {
      const status: ControlMapStatus = controlMap[id].status;
      Object.entries(status).forEach(
        ([dancerName, dancerStatus]: [DancerName, DancerStatus]) => {
          Object.entries(dancerStatus).forEach(([partName, part]) => {
            if (
              partTypeMap[partName] === LED_TYPE &&
              (part as LEDData).src !== NO_EFFECT
            ) {
              ledEffectRecord[dancerName][partName].push(id);
            }
          });
        }
      );
    });

    state.ledEffectRecord = ledEffectRecord;
  },
});

export const { setLEDMap, generateLedEffectRecord } = actions;
