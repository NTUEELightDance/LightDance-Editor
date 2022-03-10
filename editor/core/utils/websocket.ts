import { FIBER, NO_EFFECT } from "constants";
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

interface DancerControlLed {
  [key: DancerName]: ControlLed[];
}

interface ControlLed {
  start: number;
  fade: boolean;
  status: {
    [key: PartName]: Bulb[]; // LED is an array of colorCode and alpha
  };
}

interface Bulb {
  colorCode: number;
  alpha: number;
}

/**
 * Generate ControlOF with format that RPi needs (turn into dancer base)
 */
export function generateControlOF(
  controlRecord: ControlRecord,
  controlMap: ControlMap,
  dancers: Dancers,
  partTypeMap: PartTypeMap,
  colorMap: ColorMap
) {
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
        !isEqual(newControl[i], oldControl[i - 1])
      ) {
        newControl.push(oldControl[i]);
      }
    }
    dancerControlOF[dancerName] = newControl;
  });

  console.log(dancerControlOF);
  return dancerControlOF;
}

/**
 * Generate ControlLed with format that RPi needs (turn into dancer base)
 */
export function generateControlLed(
  controlRecord: ControlRecord,
  controlMap: ControlMap,
  dancers: Dancers,
  partTypeMap: PartTypeMap,
  ledEffectRecord: LedEffectRecord,
  ledMap: LedMap
) {
  const DancerControlLed: DancerControlLed = {};
  Object.keys(dancers).forEach((dancerName) => {
    DancerControlLed[dancerName] = [];
  });

  // make a temporary one
  // saving the led effect's

  //   controlRecord.forEach((id) => {
  //     const { start, status, fade } = controlMap[id];
  //     Object.keys(status).forEach((dancerName) => {
  //       const newStatus: {
  //         [key: PartName]: Bulb[];
  //       } = {};
  //       Object.keys(status[dancerName]).forEach((partName) => {
  //         if (partTypeMap[partName] === LED) {
  //           const { src } = status[dancerName][partName] as LED;
  //           if (src === NO_EFFECT) return;
  //           // TODO: get the effects from ledMap
  //         }
  //       });
  //     });
  //   });
}
