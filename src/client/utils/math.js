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
    time >= data[frame + 1].start &&
    time <= data[frame + 2].start
  ) {
    return frame + 1;
  }
  return binarySearchFrame(data, time);
}

/**
 * Calculate Interpolation of the position, return new position
 * @param {*} time
 * @param {*} preFrame - the position frame data (posRecord[posFrame])
 * @param {*} nextFrame - the next position frame data (posRecord[posFrame + 1])
 */
export function interpolationPos(time, prePosFrame, nextPosFrame) {
  const { start: preTime, pos: prePos } = prePosFrame;
  const { start: nextTime, pos: nextPos } = nextPosFrame;
  if (preTime === undefined || prePos === undefined)
    throw new Error(
      `[Error] interplolationPos, invalid prePosFrame ${preTime}`,
      prePos
    );
  if (nextTime === undefined || nextPos === undefined)
    throw new Error(
      `[Error] interplolationPos, invalid nextPosFrame ${nextTime}`,
      nextPos
    );

  const newPos = {};
  Object.keys(prePos).forEach((dancer) => {
    const dancerPrePos = prePos[dancer];
    const dancerNextPos = nextPos[dancer];
    const dancerPos = {};
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
