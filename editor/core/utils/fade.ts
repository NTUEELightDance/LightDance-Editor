import type {
  ControlMapElement,
  ControlMapStatus,
  ColorMap,
  RGB,
} from "../models";
import { isLEDData, isFiberData } from "../models";

import { Color } from "three";

function round1(number: number) {
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
      if (isLEDData(preVal) && isLEDData(nextVal)) {
        newStatus[dancer][part] = {
          alpha: round1(
            ((nextVal.alpha - preVal.alpha) * (time - preTime)) /
              (nextTime - preTime) +
              preVal.alpha
          ),
          effectID: preVal.effectID,
        };
      }

      // fiber Parts
      else if (isFiberData(preVal) && isFiberData(nextVal)) {
        // Compute fade color with previous color and next color
        const newColorRGB = fadeColor(
          colorMap[preVal.colorID].rgb,
          colorMap[nextVal.colorID].rgb,
          time,
          preTime,
          nextTime
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
          colorID: preVal.colorID,
          rgb: newColorRGB,
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

// RGB 0-255
export function fadeColor(
  preRGB: RGB,
  nextRGB: RGB,
  time: number,
  preTime: number,
  nextTime: number
): RGB {
  // Compute fade color with previous color and next color
  const preColor = new Color().setRGB(
    preRGB[0] / 255,
    preRGB[1] / 255,
    preRGB[2] / 255
  );
  const nextColor = new Color().setRGB(
    nextRGB[0] / 255,
    nextRGB[1] / 255,
    nextRGB[2] / 255
  );
  preColor.lerp(nextColor, (time - preTime) / (nextTime - preTime));

  const currentRGb: RGB = [
    Math.round(preColor.r * 255),
    Math.round(preColor.g * 255),
    Math.round(preColor.b * 255),
  ];

  return currentRGb;
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
export function fadeAlpha(
  preAlpha: number,
  nextAlpha: number,
  time: number,
  preTime: number,
  nextTime: number
) {
  return round1(
    ((nextAlpha - preAlpha) * (time - preTime)) / (nextTime - preTime) +
      preAlpha
  );
}
