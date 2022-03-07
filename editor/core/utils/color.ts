import _ from "lodash";

/**
 * deleteColorCode return status without colorCode
 * @param {object} status - target status
 */
export function deleteColorCode(status) {
  const pureStatus = _.cloneDeep(status);

  Object.keys(status).forEach((name) => {
    const dancer = status[name];
    Object.keys(dancer).forEach((partName) => {
      const part = dancer[partName];
      if (part["colorCode"]) delete pureStatus[name][partName]["colorCode"];
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
  if (colorCode.length !== 6) {
    throw `[Error] Invalid paramter at function colorCode2Rgb ${colorCode}`;
  }
  return [
    parseInt(m.substr(0, 2), 16),
    parseInt(m.substr(2, 2), 16),
    parseInt(m.substr(4, 2), 16),
  ];
}

/**
 * Convert [r, g, b] to ColorCode
 * @param rgb [r, g, b]
 * @returns ColorCode
 */
export function Rgb2ColorCode(rgb: number[]) {
  if (rgb.length !== 3) {
    throw `[Error] Invalid parameter at function Rgb2ColorCode`;
  }
  const [r, g, b] = rgb;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}
