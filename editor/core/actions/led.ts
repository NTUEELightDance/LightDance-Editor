import { registerActions } from "../registerActions";
// types
import {
  State,
  CurrentLedEffect,
  ControlMapStatus,
  LedEffectRecord,
  DancerName,
  DancerStatus,
  LED,
} from "../models";
// utils
import { getControl } from "../utils";
import { LED as LED_CONST, NO_EFFECT } from "constants";

const actions = registerActions({
  /**
   * initialize the currentLedEffectIndexMap
   * @param {State} state
   */
  initCurrentLedEffect: (state: State) => {
    const { dancers, partTypeMap } = state;
    const tmp: CurrentLedEffect = {};
    Object.entries(dancers).map(([dancerName, parts]) => {
      tmp[dancerName] = {};
      parts.forEach((part) => {
        if (partTypeMap[part] === LED_CONST) {
          tmp[dancerName][part] = {
            effect: [],
            index: 0,
          };
        }
      });
    });
    state.currentLedEffect = tmp;
  },

  /**
   * Generate LedEffectRecord
   * According to controlMap and controlRecord
   * stripped out no-effect source
   * @param state
   */
  generateLedEffectRecord: async (state: State) => {
    const { dancers, partTypeMap } = state;
    const [controlMap, controlRecord] = await getControl();

    const ledEffectRecord: LedEffectRecord = {};

    // initialize the ledEffectRecord
    Object.entries(dancers).map(([dancerName, parts]) => {
      ledEffectRecord[dancerName] = {};
      parts.forEach((partName) => {
        if (partTypeMap[partName] === LED_CONST) {
          ledEffectRecord[dancerName][partName] = [];
        }
      });
    });

    // go through control record, add the index if the led source is "no-effect"
    controlRecord.forEach((id: string) => {
      const status: ControlMapStatus = controlMap[id].status;
      Object.entries(status).forEach(
        ([dancerName, dancerStatus]: [DancerName, DancerStatus]) => {
          Object.entries(dancerStatus).forEach(([partName, part]) => {
            if (
              partTypeMap[partName] === LED_CONST &&
              (part as LED).src !== NO_EFFECT
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

export const { initCurrentLedEffect, generateLedEffectRecord } = actions;
