import { fadeAlpha, fadeColor } from "./fade";

import {
  ControlMap,
  LED,
  CurrentLedEffect,
  LedMap,
  LedEffectFrame,
  LedEffectRecord,
} from "../models";

import { cloneDeep } from "lodash";
import { updateFrameByTimeMap } from "./frame";

/**
 * Update the currentLedEffect
 * according to ControlMap, LedEffectRecord, CurrentLedEffect, LedMap, time
 * @param controlMap
 * @param ledEffectRecord
 * @param currentLedEffect
 * @param ledMap
 * @param time
 * @returns
 */
export function updateLedEffect(
  controlMap: ControlMap,
  ledEffectRecord: LedEffectRecord,
  currentLedEffect: CurrentLedEffect,
  ledMap: LedMap,
  time: number
) {
  Object.keys(currentLedEffect).forEach((dancerName) => {
    Object.keys(currentLedEffect[dancerName]).forEach((partName) => {
      if (ledEffectRecord[dancerName][partName].length === 0) {
        // there is nothing to do with empty record, which every src is no_effect
        return;
      }

      const lastRecordIndex =
        currentLedEffect[dancerName][partName].recordIndex;

      // calculate the right place of record index in ledEffectRecord
      const recordIndex = updateFrameByTimeMap(
        ledEffectRecord[dancerName][partName],
        controlMap,
        currentLedEffect[dancerName][partName].recordIndex,
        time
      );
      currentLedEffect[dancerName][partName].recordIndex = recordIndex;

      const recordId = ledEffectRecord[dancerName][partName][recordIndex];

      // get src from controlMap and recordId
      const { start: currentStart, status: currentStatus } =
        controlMap[recordId];

      // we have assumed the lowest recordIndex is zero, but it may has no effect at the beginning
      // but it will render the first effect
      // the case will be like the time now is before the frame start (currentStart)
      if (time < currentStart) {
        // reset the effect
        currentLedEffect[dancerName][partName].effect = [];
        return;
      }

      const { src } = currentStatus[dancerName][partName] as LED;
      if (!src || !ledMap[partName][src]) {
        throw `[Invalid src] ${dancerName} ${partName} ${recordId}`;
      }

      // get repeat, effects from ledMap and src
      const { repeat, effects } = ledMap[partName][src];

      let offset = time - currentStart; // get the offset of time (since the led effect begins from 0)
      // calculate the offset with repeat
      // ** Repeat don't work on last effect's start being zero (Only one effect frame) **
      if (effects.length > 0 && effects[effects.length - 1].start > 0) {
        const duration = effects[effects.length - 1].start;
        const repeatedTimes = Math.floor(offset / duration);
        if (repeat === 0 || repeatedTimes < repeat) {
          // continously repeat on repeat being zero
          // else run repeat times
          offset = offset % duration;
        }
      }

      // if change to another recordIndex, need to reset the effectIndex and effect first
      if (lastRecordIndex !== recordIndex) {
        currentLedEffect[dancerName][partName].effectIndex = 0;
        currentLedEffect[dancerName][partName].effect = [];
      }

      // Goal: calculate the right newLedEffect[dancerName][partName]'s effectIndex
      const { effectIndex } = currentLedEffect[dancerName][partName];
      let newEffectIndex;
      // Case 1: index is already in the right place (after resetting or not being the time to switch to the next one)
      if (
        effects[effectIndex + 1] &&
        offset >= effects[effectIndex].start &&
        offset <= effects[effectIndex + 1].start
      ) {
        newEffectIndex = effectIndex;
      }
      // Case 2: index should bethe next one (when playing)
      else if (
        effects[effectIndex + 2] &&
        offset >= effects[effectIndex + 1].start &&
        offset <= effects[effectIndex + 2].start
      ) {
        newEffectIndex = effectIndex + 1;
      }
      // Case 3: neither 1 nor 2, should calculate the new index (when setting to a random time)
      else {
        newEffectIndex = binarySearchLedEffectFrame(effects, offset);
      }
      currentLedEffect[dancerName][partName].effectIndex = newEffectIndex;

      // Goal: calculate the right currentLedEffect[dancerName][partName]'s effect
      let {
        start: currStart,
        effect: currEffect,
        fade,
      } = effects[newEffectIndex];
      // Do fade or not
      if (fade && effects[newEffectIndex + 1]) {
        // currEffect may be the reference of the ledMap -> make a new clone for not modifying the ledMap
        currEffect = cloneDeep(currEffect);
        // do fade
        const { start: nextStart, effect: nextEffect } =
          effects[newEffectIndex + 1];
        if (nextEffect.length !== currEffect.length) {
          throw `[Error] ${dancerName} ${partName} ${src} effect length not the same (start: ${currStart})`;
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
      currentLedEffect[dancerName][partName].effect = currEffect;
    });
  });
  return currentLedEffect;
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
  if (!Array.isArray(frames)) {
    throw new Error(
      "[Error] binarySearchLedFrame, invalid parameter(controlRecord)"
    );
  }

  if (typeof offset !== "number") {
    throw new Error("[Error] binarySearchFrame, invalid parameter(time)");
  }
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
