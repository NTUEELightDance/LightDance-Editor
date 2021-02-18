/**
 * clamp a value between mi and ma
 * @param {number} val - target
 * @param {number} mi - lowerbound of the target
 * @param {number} ma - upperbound of the target
 */
export function clamp(val, mi, ma) {
  // eslint-disable-next-line no-nested-ternary
  return val > ma ? ma : val < mi ? mi : val;
}

/**
 * binarySearch the data (array of object with start), return the index
 * @param {object} data - target control (array of status)
 * @param {number} time - target time
 */
export function binarySearchFrame(data, time) {
  if (!Array.isArray(data))
    throw new Error(`[Error] binarySearchFrame, invalid parameter(data)`);
  if (typeof time !== "number")
    throw new Error(`[Error] binarySearchFrame, invalid parameter(time)`);
  let l = 0;
  let r = data.length - 1;
  let m = Math.floor((l + r + 1) / 2);
  while (l < r) {
    if (data[m].start <= time) l = m;
    else r = m - 1;
    m = Math.floor((l + r + 1) / 2);
  }
  return m;
}

/**
 * Update Frame Index By Time
 * @param {object} data - control
 * @param {number} frame - frame idx
 * @param {number} time - timestamp
 */
export function updateFrameByTime(data, frame, time) {
  if (!Array.isArray(data))
    throw new Error(`[Error] updateFrameByTime, invalid parameter(data)`);
  if (typeof frame !== "number")
    throw new Error(`[Error] updateFrameByTime, invalid parameter(frame)`);
  if (typeof time !== "number")
    throw new Error(`[Error] updateFrameByTime, invalid parameter(time)`);
  // Check if need to do binarysearch
  if (
    data[frame + 2] &&
    time >= data[frame + 1].Start &&
    time <= data[frame + 2].Start
  ) {
    return frame + 1;
  }
  return binarySearchFrame(data, time);
}
