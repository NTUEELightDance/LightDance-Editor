import {
  ControlRecord,
  PosRecord,
  ControlMap,
  PosMap,
  PosMapElement,
  Coordinates,
  DancerCoordinates,
  LedRecord
} from "../models";

/**
 * Update Frame Index By Time With controlRecord/posRecord and controlMap/posMap
 * @param {array} record - controlRecord or posRecord
 * @param {object} map - controlMap or posMap
 * @param {number} frame - frame idx
 * @param {number} time - timestamp
 */
export function updateFrameByTimeMap (
  record: ControlRecord | PosRecord | LedRecord,
  map: ControlMap | PosMap,
  frame: number,
  time: number
) {
  if (!Array.isArray(record)) { throw new Error("[Error] updateFrameByTimeMap, invalid parameter(record)"); }
  if (typeof map !== "object") { throw new Error("[Error] updateFrameByTimeMap, invalid parameter(map)"); }
  if (typeof frame !== "number") { throw new Error("[Error] updateFrameByTimeMap, invalid parameter(frame)"); }
  if (typeof time !== "number") { throw new Error("[Error] updateFrameByTimeMap, invalid parameter(time)"); }
  // Check if need to do binarysearch
  if (
    map[record[frame + 2]] &&
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
export function binarySearchFrameMap (
  record: ControlRecord | PosRecord,
  map: ControlMap | PosMap,
  time: number
) {
  if (!Array.isArray(record)) {
    throw new Error(
      "[Error] updateFrameByTimeMap, invalid parameter(controlRecord)"
    );
  }
  if (typeof map !== "object") {
    throw new Error(
      "[Error] updateFrameByTimeMap, invalid parameter(controlMap)"
    );
  }
  if (typeof time !== "number") { throw new Error("[Error] binarySearchFrame, invalid parameter(time)"); }
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
 * @param {*} preFrame - the position frame data (posRecord[posIndex])
 * @param {*} nextFrame - the next position frame data (posRecord[posIndex + 1])
 */
export function interpolationPos (
  time: number,
  preFrame: PosMapElement,
  nextFrame: PosMapElement
) {
  const { start: preTime, pos: prePos } = preFrame;
  const { start: nextTime, pos: nextPos } = nextFrame;
  if (preTime === undefined || prePos === undefined) {
    throw new Error(
      `[Error] interplolationPos, invalid prePosFrame ${preTime}, ${prePos}`
    );
  }
  if (nextTime === undefined || nextPos === undefined) {
    throw new Error(
      `[Error] interplolationPos, invalid nextPosFrame ${nextTime}, ${nextPos}`
    );
  }

  const newPos: DancerCoordinates = {};
  Object.keys(prePos).forEach((dancer) => {
    const dancerPrePos: Coordinates = prePos[dancer];
    const dancerNextPos: Coordinates = nextPos[dancer];
    const dancerPos: Coordinates = { x: 0, y: 0, z: 0 }; // should be coordinates
    let x: keyof typeof dancerPos;
    for (x in dancerPos) {
      dancerPos[x] =
        ((dancerNextPos[x] - dancerPrePos[x]) * (time - preTime)) /
          (nextTime - preTime) +
        dancerPrePos[x];
    }
    newPos[dancer] = dancerPos;
  });
  return newPos;
}
