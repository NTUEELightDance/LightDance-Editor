import { fadeAlpha, fadeColor } from "./fade";

import {
  ControlMap,
  ControlRecord,
  LED,
  CurrentLedEffect,
  LedMap,
  LedEffectFrame,
} from "../models";

import { cloneDeep } from "lodash";

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
  controlRecord: ControlRecord,
  controlMap: ControlMap,
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
      const { src } = status[dancerName][partName] as LED;

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
