import { FIBER } from "constants";
import {
  ColorMap,
  ControlMap,
  ControlRecord,
  DancerName,
  Dancers,
  Fiber,
  LED,
  PartName,
  PartTypeMap,
  LedMap,
  LedEffectRecord,
} from "core/models";
import { isEqual } from "lodash";
import { colorCode2int } from "./color";
// state
import { state } from "../state";
//
import { getControl, getLedMap } from "./index";

/**
 * Dancer to ControlOF Json file for RPi
 */
interface DancerControlOF {
  [key: DancerName]: ControlOF[];
}

interface ControlOF {
  start: number;
  fade: boolean;
  status: {
    [key: PartName]: Bulb; // OF has only one colorCode and alpha
  };
}

/**
 * Dancer to ControlLed Json file for RPi
 */
interface DancerControlLed {
  [key: DancerName]: PartEffect;
}

interface PartEffect {
  [key: PartName]: Effect[];
}

interface Effect {
  start: number;
  fade: boolean;
  status: Bulb[];
}

interface Bulb {
  colorCode: number;
  alpha: number;
}

/**
 * Generate ControlOF with format that RPi needs (turn into dancer base)
 */
export async function generateControlOF() {
  const [controlMap, controlRecord] = await getControl();
  const { dancers, partTypeMap, colorMap } = state;

  const dancerControlOF: DancerControlOF = {};
  Object.keys(dancers).forEach((dancerName) => {
    dancerControlOF[dancerName] = [];
  });

  // Do dancerControlOF
  controlRecord.forEach((id) => {
    const { start, status, fade } = controlMap[id];
    Object.keys(status).forEach((dancerName) => {
      const newStatus: {
        [key: PartName]: Bulb;
      } = {};
      Object.keys(status[dancerName]).forEach((partName) => {
        if (partTypeMap[partName] === FIBER) {
          const fiber = status[dancerName][partName] as Fiber;
          newStatus[partName] = {
            colorCode: colorCode2int(colorMap[fiber.color]),
            alpha: fiber.alpha,
          };
        }
      });
      dancerControlOF[dancerName].push({
        start,
        fade,
        status: newStatus,
      });
    });
  });

  // remove not changing frames
  Object.keys(dancers).forEach((dancerName) => {
    const oldControl = dancerControlOF[dancerName];
    if (oldControl.length === 0) return;

    const newControl: ControlOF[] = [oldControl[0]];
    for (let i = 1; i < oldControl.length; ++i) {
      // Case 1: Last frame need fade, so this should be recorded
      // Case 2: Two frame are not the same, so this should be recorded
      if (
        oldControl[i - 1].fade ||
        !isEqual(oldControl[i].status, oldControl[i - 1].status) ||
        oldControl[i].fade
      ) {
        newControl.push(oldControl[i]);
      }
    }
    dancerControlOF[dancerName] = newControl;
  });

  return dancerControlOF;
}

/**
 * Generate ControlLed with format that RPi needs (turn into dancer base)
 */
export async function generateControlLed() {
  const [controlMap] = await getControl();
  const ledMap = await getLedMap();
  const { ledEffectRecord } = state;

  const dancerControlLed: DancerControlLed = {};
  Object.entries(ledEffectRecord).forEach(([dancerName, parts]) => {
    const partEffect: PartEffect = {};
    Object.entries(parts).forEach(([partName, recordIds]) => {
      // turn recordIds to according effect
      const newEffects: Effect[] = [];
      recordIds.forEach((recordId, recordIndex) => {
        const { start: baseStart, status } = controlMap[recordId];
        const src = (status[dancerName][partName] as LED).src;
        let { repeat, effects } = ledMap[partName][src];

        if (effects.length === 0) {
          console.error(
            `[Error] generateControlLed, can't have emtpy effects. ([${baseStart}] ${dancerName}, ${partName}, ${src}})`
          );
          return;
        }

        // check repeat times
        if (repeat === 0) {
          if (recordIndex === recordIds.length - 1) {
            console.error(
              `[Warning] generateControlLed, can't have repeat to be zero on last led frame. ([${baseStart}] ${dancerName}, ${partName}, ${src})`
            );
            // make it to repeat only one time
            repeat = 1;
          } else {
            repeat = Infinity;
          }
        }

        // check nextStart
        let nextStart: number;
        if (recordIndex !== recordIds.length - 1) {
          nextStart = controlMap[recordIds[recordIndex + 1]].start;
        } else {
          // this is the last frame, no next start
          nextStart = Infinity;
        }

        let effectIndex = 0,
          effectStart = 0,
          totalRepeated = 0;

        const duration = effects[effects.length - 1].start;

        while (effectStart < nextStart && totalRepeated < repeat) {
          const { start, fade, effect } = effects[effectIndex];
          effectStart = baseStart + start + duration * totalRepeated;
          newEffects.push({
            start: effectStart,
            fade,
            status: effect.map(({ colorCode, alpha }) => ({
              colorCode: colorCode2int(colorCode),
              alpha,
            })),
          });
          if (effects.length === 1) break;
          ++effectIndex;
          // do repeat
          if (effectIndex === effects.length - 1) {
            // pop out the last effect
            newEffects.pop();
            ++totalRepeated;
            effectIndex = 0;
          }
        }
      });

      partEffect[partName] = newEffects;
    });

    dancerControlLed[dancerName] = partEffect;
  });

  return dancerControlLed;
}
