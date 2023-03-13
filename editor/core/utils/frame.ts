import {
  ControlRecord,
  PosRecord,
  ControlMap,
  PosMap,
  PosMapElement,
  Coordinates,
  PosMapStatus,
  LEDRecord,
} from "../models";

/**
 * Update Frame Index By Time With controlRecord/posRecord and controlMap/posMap
 * @param {array} record - controlRecord or posRecord
 * @param {object} map - controlMap or posMap
 * @param {number} controlIndex - frame idx
 * @param {number} time - timestamp
 */
export function updateFrameByTimeMap(
  record: ControlRecord | PosRecord | LEDRecord,
  map: ControlMap | PosMap,
  controlIndex: number,
  time: number
) {
  if (!Array.isArray(record)) {
    throw new Error("[Error] updateFrameByTimeMap, invalid parameter(record)");
  }
  if (typeof map !== "object") {
    throw new Error("[Error] updateFrameByTimeMap, invalid parameter(map)");
  }
  if (typeof controlIndex !== "number") {
    throw new Error("[Error] updateFrameByTimeMap, invalid parameter(frame)");
  }
  if (typeof time !== "number") {
    throw new Error("[Error] updateFrameByTimeMap, invalid parameter(time)");
  }

  // Check if need to do binary search
  if (
    map[record[controlIndex + 2]] &&
    time >= map[record[controlIndex + 1]].start &&
    time <= map[record[controlIndex + 2]].start
  ) {
    return controlIndex + 1;
  }

  return binarySearchObjects(record, time, (val) => map[val].start);
}

export function binarySearchObjects<T>(
  data: T[],
  target: number,
  getComparable: (val: T) => number
) {
  let low = 0;
  let high = data.length - 1;
  let center = Math.floor((low + high + 1) / 2);

  while (low < high) {
    if (getComparable(data[center]) <= target) {
      low = center;
    } else {
      high = center - 1;
    }
    center = Math.floor((low + high + 1) / 2);
  }
  return center;
}

/**
 * Calculate Interpolation of the position, return new position
 * @param {*} time
 * @param {*} preFrame - the position frame data (posRecord[posIndex])
 * @param {*} nextFrame - the next position frame data (posRecord[posIndex + 1])
 */
export function interpolatePos(
  time: number,
  preFrame: PosMapElement,
  nextFrame: PosMapElement
) {
  const { start: preTime, pos: prePos } = preFrame;
  const { start: nextTime, pos: nextPos } = nextFrame;
  if (preTime === undefined || prePos === undefined) {
    throw new Error(
      `[Error] interpolatePos, invalid prePosFrame ${preTime}, ${prePos}`
    );
  }
  if (nextTime === undefined || nextPos === undefined) {
    throw new Error(
      `[Error] interpolatePos, invalid nextPosFrame ${nextTime}, ${nextPos}`
    );
  }

  const newPos: PosMapStatus = {};
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
