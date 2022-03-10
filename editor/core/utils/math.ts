import {
  ControlMapElement,
  ControlMapType,
  ControlRecordType,
  ControlMapStatus,
  LED,
  Fiber,
  El,
  PosRecordType,
  PosMapType,
  PosMapElement,
  Coordinates,
  ColorMapType,
  CurrentLedEffect,
  LedMap,
  LedEffectFrame,
  ColorCode,
} from "../models";

import { cloneDeep } from "lodash";

import { Color } from "three";

function CheckTypeOfLED(object: LED | Fiber | El): object is LED {
  return (
    (object as LED)["src"] !== undefined &&
    (object as LED)["alpha"] !== undefined
  );
}

function CheckTypeOfFiber(object: LED | Fiber | El): object is Fiber {
  return (
    (object as Fiber)["color"] !== undefined &&
    (object as Fiber)["alpha"] !== undefined
  );
}

function CheckTypeOfEl(object: LED | Fiber | El): object is El {
  return typeof (object as El) === "number";
}

/**
 * clamp a value between mi and ma
 * @param {number} val - target
 * @param {number} mi - lowerbound of the target
 * @param {number} ma - upperbound of the target
 */
export function clamp(val: number, mi: number, ma: number) {
  // eslint-disable-next-line no-nested-ternary
  return val > ma ? ma : val < mi ? mi : val;
}

/**
 * Update Frame Index By Time With controlRecord/posRecord and controlMap/posMap
 * @param {array} record - controlRecord or posRecord
 * @param {object} map - controlMap or posMap
 * @param {number} frame - frame idx
 * @param {number} time - timestamp
 */
export function updateFrameByTimeMap(
  record: ControlRecordType | PosRecordType,
  map: ControlMapType | PosMapType,
  frame: number,
  time: number
) {
  if (!Array.isArray(record))
    throw new Error(`[Error] updateFrameByTimeMap, invalid parameter(record)`);
  if (typeof map !== "object")
    throw new Error(`[Error] updateFrameByTimeMap, invalid parameter(map)`);
  if (typeof frame !== "number")
    throw new Error(`[Error] updateFrameByTimeMap, invalid parameter(frame)`);
  if (typeof time !== "number")
    throw new Error(`[Error] updateFrameByTimeMap, invalid parameter(time)`);
  // Check if need to do binarysearch
  if (
    map[record[frame + 2]] &&
    time >= map[record[frame + 1]].start &&
    time <= map[record[frame + 2]].start
  ) {
    return frame + 1;
  }
  return binarySearchFrameMap(record, map, time);
}

/**
 * binarySearch based on controlRecord and controlMap (array of object with start), return the index
 * @param {object} data - target control (array of status)
 * @param {number} time - target time
 */
export function binarySearchFrameMap(
  record: ControlRecordType | PosRecordType,
  map: ControlMapType | PosMapType,
  time: number
) {
  if (!Array.isArray(record))
    throw new Error(
      `[Error] updateFrameByTimeMap, invalid parameter(controlRecord)`
    );
  if (typeof map !== "object")
    throw new Error(
      `[Error] updateFrameByTimeMap, invalid parameter(controlMap)`
    );
  if (typeof time !== "number")
    throw new Error(`[Error] binarySearchFrame, invalid parameter(time)`);
  let l = 0;
  let r = record.length - 1;
  let m = Math.floor((l + r + 1) / 2);
  while (l < r) {
    if (map[record[m]].start <= time) l = m;
    else r = m - 1;
    m = Math.floor((l + r + 1) / 2);
  }
  return m;
}

/**
 * Calculate Interpolation of the position, return new position
 * @param {*} time
 * @param {*} preFrame - the position frame data (posRecord[posIndex])
 * @param {*} nextFrame - the next position frame data (posRecord[posIndex + 1])
 */
export function interpolationPos(
  time: number,
  preFrame: PosMapElement,
  nextFrame: PosMapElement
) {
  const { start: preTime, pos: prePos } = preFrame;
  const { start: nextTime, pos: nextPos } = nextFrame;
  if (preTime === undefined || prePos === undefined)
    throw new Error(
      `[Error] interplolationPos, invalid prePosFrame ${preTime}, ${prePos}`
    );
  if (nextTime === undefined || nextPos === undefined)
    throw new Error(
      `[Error] interplolationPos, invalid nextPosFrame ${nextTime}, ${nextPos}`
    );

  const newPos = {};
  Object.keys(prePos).forEach((dancer) => {
    const dancerPrePos: Coordinates = prePos[dancer];
    const dancerNextPos: Coordinates = nextPos[dancer];
    const dancerPos: Coordinates = { x: 0, y: 0, z: 0 }; //should be coordinates
    Object.keys(dancerPrePos).forEach((x) => {
      dancerPos[x] =
        ((dancerNextPos[x] - dancerPrePos[x]) * (time - preTime)) /
          (nextTime - preTime) +
        dancerPrePos[x];
    });
    newPos[dancer] = dancerPos;
  });
  return newPos;
}

function Round1(number: number) {
  return Math.round(number * 10) / 10;
}

/**
 * Fade between the status
 * @param {*} time
 * @param {*} preStatus - previous frame, controlRecord[controlIndex]
 * @param {*} nextStatus - next frame, controlRecord[controlIndex + 1]
 */
export function fadeStatus(
  time: number,
  preFrame: ControlMapElement,
  nextFrame: ControlMapElement,
  colorMap: ColorMapType
) {
  const { start: preTime, fade, status: preStatus } = preFrame;
  const { start: nextTime, status: nextStatus } = nextFrame;
  if (!fade) return preFrame.status; // Don't need to fade
  // need to fade - interpolation
  const newStatus: ControlMapStatus = {};
  Object.keys(preStatus).forEach((dancer) => {
    const preParts = preStatus[dancer];
    const nextParts = nextStatus[dancer];
    newStatus[dancer] = {};
    Object.keys(preParts).forEach((part) => {
      const preVal = preParts[part];
      const nextVal = nextParts[part];

      // LED Parts
      if (CheckTypeOfLED(preVal) && CheckTypeOfLED(nextVal)) {
        newStatus[dancer][part] = {
          alpha: Round1(
            ((nextVal.alpha - preVal.alpha) * (time - preTime)) /
              (nextTime - preTime) +
              preVal.alpha
          ),
          src: preVal.src,
        };
      }
      /*
        if (preVal.alpha !== undefined && nextVal.alpha !== undefined) {
          newStatus[dancer][part] = {
            alpha: Round1(
              ((nextVal.alpha - preVal.alpha) * (time - preTime)) /
                (nextTime - preTime) +
                preVal.alpha
            ),
            src: preVal.src,
          };
        }*/
      // El Parts
      else if (CheckTypeOfEl(preVal) && CheckTypeOfEl(nextVal)) {
        //if (typeof preVal === "number" && typeof nextVal === "number") {
        newStatus[dancer][part] = Round1(
          ((nextVal - preVal) * (time - preTime)) / (nextTime - preTime) +
            preVal
        );
        //}
      }
      // fiber Parts
      else if (CheckTypeOfFiber(preVal) && CheckTypeOfFiber(nextVal)) {
        // Compute fade color with previous color and next color
        const newColorHex = fadeColor(
          colorMap[preVal.color],
          colorMap[nextVal.color],
          time,
          preTime,
          nextTime
        );
        const newColor = new Color().setHex(
          parseInt(newColorHex.replace(/^#/, ""), 16)
        );
        // Compute new alpha
        const newAlpha = fadeAlpha(
          preVal.alpha,
          nextVal.alpha,
          time,
          preTime,
          nextTime
        );

        // assign colorCode(fade Color) if fade and between two frames
        newStatus[dancer][part] = {
          alpha: newAlpha,
          color: preVal.color,
          colorCode: newColor,
        };
      } else {
        throw new Error(
          `[Error] fadeStatus, invalid parts ${preVal}, ${nextVal}`
        );
      }
    });
  });
  return newStatus;
}

/**
 * Color Fade
 * @param preHex #ffffff
 * @param nextHex #ffffff
 * @param time
 * @param preTime
 * @param nextTime
 * @returns
 */
function fadeColor(
  preHex: ColorCode,
  nextHex: ColorCode,
  time: number,
  preTime: number,
  nextTime: number
) {
  // Compute fade color with previous color and next color
  const preColor = new Color().setHex(parseInt(preHex.replace(/^#/, ""), 16));
  const nextColor = new Color().setHex(parseInt(nextHex.replace(/^#/, ""), 16));
  preColor.lerp(nextColor, (time - preTime) / (nextTime - preTime));
  return `#${preColor.getHexString()}`;
}

/**
 * alpha fade
 * @param preAlpha
 * @param nextAlpha
 * @param time
 * @param preTime
 * @param nextTime
 * @returns
 */
function fadeAlpha(
  preAlpha: number,
  nextAlpha: number,
  time: number,
  preTime: number,
  nextTime: number
) {
  return Round1(
    ((nextAlpha - preAlpha) * (time - preTime)) / (nextTime - preTime) +
      preAlpha
  );
}

/**
 * Update the currentLedEffect
 * @param lastControlIndex
 * @param newControlIndex
 * @param currentLedEffect
 * @param controlRecord
 * @param controlMap
 * @param ledMap
 * @param time
 * @returns
 */
export function updateLedEffect(
  lastControlIndex: number,
  newControlIndex: number,
  currentLedEffect: CurrentLedEffect,
  controlRecord: ControlRecordType,
  controlMap: ControlMapType,
  ledMap: LedMap,
  time: number
) {
  const newLedEffect = currentLedEffect;

  // jump to another controlIndex -> first reset the ledEffect
  if (lastControlIndex !== newControlIndex) resetLedEffect(newLedEffect);

  // now at the right controlIndex, check the sub index of ledEffect
  Object.keys(newLedEffect).forEach((dancerName) => {
    Object.keys(newLedEffect[dancerName]).forEach((partName) => {
      const { index } = newLedEffect[dancerName][partName];

      const { start, status } = controlMap[controlRecord[newControlIndex]];
      const { src, alpha: effectAlpha } = status[dancerName][partName] as LED;

      if (!src || !ledMap[partName][src]) return;
      const { repeat, effects } = ledMap[partName][src]; // repeat WON'T BE FUNCIONAL IN THIS VERSION, NEED RETHINKING OF DATA FORMAT

      const offset = time - start; // get the offset of time (since the led effect begins from 0)

      // Goal: calculate the right newLedEffect[dancerName][partName]'s index
      let newIndex;
      // Case 1: index is already in the right place (after resetting or not being the time to switch to the next one)
      if (
        effects[index + 1] &&
        offset >= effects[index].start &&
        offset <= effects[index + 1].start
      ) {
        newIndex = index;
      }
      // Case 2: index should bethe next one (when playing)
      else if (
        effects[index + 2] &&
        offset >= effects[index + 1].start &&
        offset <= effects[index + 2].start
      ) {
        newIndex = index + 1;
      }
      // Case 3: neither 1 nor 2, should calculate the new index (when setting to a random time)
      else {
        newIndex = binarySearchLedEffectFrame(effects, offset);
      }

      newLedEffect[dancerName][partName].index = newIndex;

      // Goal: calculate the right newLedEffect[dancerName][partName]'s effect
      let { start: currStart, effect: currEffect, fade } = effects[newIndex];

      // Do fade or not
      if (fade && effects[newIndex + 1]) {
        // currEffect may be the reference of the ledMap -> make a new clone for not modifying the ledMap
        currEffect = cloneDeep(currEffect);
        // do fade
        const { start: nextStart, effect: nextEffect } = effects[newIndex + 1];

        if (nextEffect.length !== currEffect.length) {
          throw `[Error] ${dancerName}/${partName}/${src} effect length not the same (start: ${currStart})`;
        }

        currEffect.forEach((_, idx) => {
          const { colorCode: currColorCode, alpha: currAlpha } =
            currEffect[idx];
          const { colorCode: nextColorCode, alpha: nextAlpha } =
            nextEffect[idx];

          const newColor = fadeColor(
            currColorCode,
            nextColorCode,
            offset,
            currStart,
            nextStart
          );

          const newAlpha = fadeAlpha(
            currAlpha,
            nextAlpha,
            offset,
            currStart,
            nextStart
          );

          currEffect[idx] = {
            colorCode: newColor,
            alpha: newAlpha,
          };
        });
      }
      newLedEffect[dancerName][partName].effect = currEffect;
    });
  });

  return newLedEffect;
}

/**
 * Reset all the index in the ledEffect to zero
 * Reselt the effect to empty
 * @param {CurrentLedEffect} ledEffect
 */
function resetLedEffect(ledEffect: CurrentLedEffect) {
  Object.keys(ledEffect).forEach((dancerName) => {
    Object.keys(ledEffect[dancerName]).forEach((partName) => {
      ledEffect[dancerName][partName].index = 0;
      ledEffect[dancerName][partName].effect = [];
    });
  });
}

/**
 * binarySearch based on controlRecord and controlMap (array of object with start), return the index
 * @param {object} data - target control (array of status)
 * @param {number} time - target time
 */
export function binarySearchLedEffectFrame(
  frames: LedEffectFrame[],
  offset: number
) {
  if (!Array.isArray(frames))
    throw new Error(
      `[Error] binarySearchLedFrame, invalid parameter(controlRecord)`
    );

  if (typeof offset !== "number")
    throw new Error(`[Error] binarySearchFrame, invalid parameter(time)`);
  let l = 0;
  let r = frames.length - 1;
  let m = Math.floor((l + r + 1) / 2);
  while (l < r) {
    if (frames[m].start <= offset) l = m;
    else r = m - 1;
    m = Math.floor((l + r + 1) / 2);
  }
  return m;
}
