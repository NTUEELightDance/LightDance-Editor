import {
  ControlMapElement,
  ControlMapStatus,
  LED,
  Fiber,
  El,
  ColorMap,
  ColorCode
} from "../models";

import { Color } from "three";

function Round1 (number: number) {
  return Math.round(number * 10) / 10;
}

function CheckTypeOfLED (object: LED | Fiber | El): object is LED {
  return (
    (object as LED).src !== undefined &&
    (object as LED).alpha !== undefined
  );
}

function CheckTypeOfFiber (object: LED | Fiber | El): object is Fiber {
  return (
    (object as Fiber).color !== undefined &&
    (object as Fiber).alpha !== undefined
  );
}

function CheckTypeOfEl (object: LED | Fiber | El): object is El {
  return typeof (object as El) === "number";
}

/**
 * Fade between the status
 * @param {*} time
 * @param {*} preStatus - previous frame, controlRecord[controlIndex]
 * @param {*} nextStatus - next frame, controlRecord[controlIndex + 1]
 */
export function fadeStatus (
  time: number,
  preFrame: ControlMapElement,
  nextFrame: ControlMapElement,
  colorMap: ColorMap
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
          src: preVal.src
        };
      }

      // El Parts
      else if (CheckTypeOfEl(preVal) && CheckTypeOfEl(nextVal)) {
        // if (typeof preVal === "number" && typeof nextVal === "number") {
        newStatus[dancer][part] = Round1(
          ((nextVal - preVal) * (time - preTime)) / (nextTime - preTime) +
            preVal
        );
        // }
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
          colorCode: newColor
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
export function fadeColor (
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
export function fadeAlpha (
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
