import {
  posRecordType,
  posRecordElement,
  coordinates,
  ControlMapElement,
  ControlMapType,
  ControlRecordType,
  CheckTypeOfEl,
  CheckTypeOfFiber,
  CheckTypeOfLED,
  ControlMapStatus,
} from "../types/globalSlice";

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
 * binarySearch the data (array of object with start), return the index
 * @param {object} data - target control (array of status)
 * @param {number} time - target time
 */
export function binarySearchFrame(
  data: posRecordType | ControlMapElement[],
  time: number
) {
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
export function updateFrameByTime(
  data: posRecordType | ControlMapElement[],
  frame: number,
  time: number
) {
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
 * binarySearch based on controlRecord and controlMap (array of object with start), return the index
 * @param {object} data - target control (array of status)
 * @param {number} time - target time
 */
export function binarySearchFrameMap(
  controlRecord: ControlRecordType,
  controlMap: ControlMapType,
  time: number
) {
  if (!Array.isArray(controlRecord))
    throw new Error(
      `[Error] updateFrameByTimeMap, invalid parameter(controlRecord)`
    );
  if (typeof controlMap !== "object")
    throw new Error(
      `[Error] updateFrameByTimeMap, invalid parameter(controlMap)`
    );
  if (typeof time !== "number")
    throw new Error(`[Error] binarySearchFrame, invalid parameter(time)`);
  let l = 0;
  let r = controlRecord.length - 1;
  let m = Math.floor((l + r + 1) / 2);
  while (l < r) {
    if (controlMap[controlRecord[m]].start <= time) l = m;
    else r = m - 1;
    m = Math.floor((l + r + 1) / 2);
  }
  return m;
}

/**
 * Update Frame Index By Time With controlRecord and controlMap
 * @param {object} data - control
 * @param {number} frame - frame idx
 * @param {number} time - timestamp
 */
export function updateFrameByTimeMap(
  controlRecord: ControlRecordType,
  controlMap: ControlMapType,
  frame: number,
  time: number
) {
  if (!Array.isArray(controlRecord))
    throw new Error(
      `[Error] updateFrameByTimeMap, invalid parameter(controlRecord)`
    );
  if (typeof controlMap !== "object")
    throw new Error(
      `[Error] updateFrameByTimeMap, invalid parameter(controlMap)`
    );
  if (typeof frame !== "number")
    throw new Error(`[Error] updateFrameByTimeMap, invalid parameter(frame)`);
  if (typeof time !== "number")
    throw new Error(`[Error] updateFrameByTimeMap, invalid parameter(time)`);
  // Check if need to do binarysearch
  if (
    controlMap[frame + 2] &&
    time >= controlMap[controlRecord[frame + 1]].start &&
    time <= controlMap[controlRecord[frame + 2]].start
  ) {
    return frame + 1;
  }
  return binarySearchFrameMap(controlRecord, controlMap, time);
}
/**
 * Calculate Interpolation of the position, return new position
 * @param {*} time
 * @param {*} preFrame - the position frame data (posRecord[timeData.posFrame])
 * @param {*} nextFrame - the next position frame data (posRecord[timeData.posFrame + 1])
 */
export function interpolationPos(
  time: number,
  preFrame: posRecordElement,
  nextFrame: posRecordElement
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
    const dancerPrePos = prePos[dancer];
    const dancerNextPos = nextPos[dancer];
    const dancerPos: coordinates = { x: 0, y: 0, z: 0 }; //should be coordinates
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
 * @param {*} preStatus - previous frame, controlRecord[timeData.controlFrame]
 * @param {*} nextStatus - next frame, controlRecord[timeData.controlFrame + 1]
 */
export function fadeStatus(
  time: number,
  preFrame: ControlMapElement,
  nextFrame: ControlMapElement
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
        newStatus[dancer][part] = {
          alpha: Round1(
            ((nextVal.alpha - preVal.alpha) * (time - preTime)) /
              (nextTime - preTime) +
              preVal.alpha
          ),
          color: preVal.color,
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
