import { ColorCode, ControlMapStatus, isFiberData } from "../models";

import _ from "lodash";
import { state } from "../state";
import { colorAgent } from "@/api";

/**
 * deleteColorCode return status without colorCode
 * @param {object} status - target status
 */
export function deleteRGB(status: ControlMapStatus) {
  const pureStatus = _.cloneDeep(status);

  Object.values(pureStatus).forEach((dancer) => {
    Object.values(dancer).forEach((part) => {
      if (isFiberData(part)) {
        delete part.rgb;
      }
    });
  });

  return pureStatus;
}

/**
 * Convert colorCode to rgb
 * @param colorCode #ffffff
 * @returns [r, g, b]
 */
export function colorCode2Rgb(colorCode: string) {
  const m = colorCode.replace(/^#/, "");
  if (m.length !== 6) {
    throw `[Error] Invalid paramter at function colorCode2Rgb ${colorCode}`;
  }
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}

/**
 * Convert [r, g, b] to ColorCode
 * @param rgb [r, g, b]
 * @returns ColorCode
 */
export function rgb2ColorCode(rgb: number[]) {
  if (rgb.length !== 3) {
    throw "[Error] Invalid parameter at function Rgb2ColorCode";
  }
  const [r, g, b] = rgb;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

/**
 * Convert colorCode to integer
 * @param colorCode #ffffff
 * @returns 16777215
 */
export function colorCode2int(colorCode: string) {
  const [r, g, b] = colorCode2Rgb(colorCode);
  let rgb = r;
  rgb = (rgb << 8) + g;
  rgb = (rgb << 8) + b;
  return rgb;
}

export async function getBlackColorID() {
  const black = Object.values(state.colorMap).find(
    (color) => color.colorCode === "#000000"
  );
  if (black) {
    return black.id;
  }

  // create black color if it doesn't exist
  const blackID = await colorAgent.addColor({
    name: "black",
    colorCode: "#000000" as ColorCode,
  });

  if (!blackID) {
    throw "[Error] Failed to create black color";
  }

  return blackID;
}
