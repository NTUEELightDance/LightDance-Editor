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
} from "../types/globalSlice";

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
    map[frame + 2] &&
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
 * @param {*} preFrame - the position frame data (posRecord[timeData.posFrame])
 * @param {*} nextFrame - the next position frame data (posRecord[timeData.posFrame + 1])
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
