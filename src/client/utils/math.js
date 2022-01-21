"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fadeStatus = exports.interpolationPos = exports.updateFrameByTime = exports.binarySearchFrame = exports.clamp = void 0;
/**
 * clamp a value between mi and ma
 * @param {number} val - target
 * @param {number} mi - lowerbound of the target
 * @param {number} ma - upperbound of the target
 */
function clamp(val, mi, ma) {
    // eslint-disable-next-line no-nested-ternary
    return val > ma ? ma : val < mi ? mi : val;
}
exports.clamp = clamp;
/**
 * binarySearch the data (array of object with start), return the index
 * @param {object} data - target control (array of status)
 * @param {number} time - target time
 */
function binarySearchFrame(data, time) {
    if (!Array.isArray(data))
        throw new Error(`[Error] binarySearchFrame, invalid parameter(data)`);
    if (typeof time !== "number")
        throw new Error(`[Error] binarySearchFrame, invalid parameter(time)`);
    let l = 0;
    let r = data.length - 1;
    let m = Math.floor((l + r + 1) / 2);
    while (l < r) {
        if (data[m].start <= time)
            l = m;
        else
            r = m - 1;
        m = Math.floor((l + r + 1) / 2);
    }
    return m;
}
exports.binarySearchFrame = binarySearchFrame;
/**
 * Update Frame Index By Time
 * @param {object} data - control
 * @param {number} frame - frame idx
 * @param {number} time - timestamp
 */
function updateFrameByTime(data, frame, time) {
    if (!Array.isArray(data))
        throw new Error(`[Error] updateFrameByTime, invalid parameter(data)`);
    if (typeof frame !== "number")
        throw new Error(`[Error] updateFrameByTime, invalid parameter(frame)`);
    if (typeof time !== "number")
        throw new Error(`[Error] updateFrameByTime, invalid parameter(time)`);
    // Check if need to do binarysearch
    if (data[frame + 2] &&
        time >= data[frame + 1].start &&
        time <= data[frame + 2].start) {
        return frame + 1;
    }
    return binarySearchFrame(data, time);
}
exports.updateFrameByTime = updateFrameByTime;
/**
 * Calculate Interpolation of the position, return new position
 * @param {*} time
 * @param {*} preFrame - the position frame data (posRecord[timeData.posFrame])
 * @param {*} nextFrame - the next position frame data (posRecord[timeData.posFrame + 1])
 */
function interpolationPos(time, preFrame, nextFrame) {
    const { start: preTime, pos: prePos } = preFrame;
    const { start: nextTime, pos: nextPos } = nextFrame;
    if (preTime === undefined || prePos === undefined)
        throw new Error(`[Error] interplolationPos, invalid prePosFrame ${preTime}`, prePos);
    if (nextTime === undefined || nextPos === undefined)
        throw new Error(`[Error] interplolationPos, invalid nextPosFrame ${nextTime}`, nextPos);
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
exports.interpolationPos = interpolationPos;
function Round1(number) {
    return Math.round(number * 10) / 10;
}
/**
 * Fade between the status
 * @param {*} time
 * @param {*} preStatus - previous frame, controlRecord[timeData.controlFrame]
 * @param {*} nextStatus - next frame, controlRecord[timeData.controlFrame + 1]
 */
function fadeStatus(time, preFrame, nextFrame) {
    const { start: preTime, fade, status: preStatus } = preFrame;
    const { start: nextTime, status: nextStatus } = nextFrame;
    if (!fade)
        return preFrame.status; // Don't need to fade
    // need to fade - interpolation
    const newStatus = {};
    Object.keys(preStatus).forEach((dancer) => {
        const preParts = preStatus[dancer];
        const nextParts = nextStatus[dancer];
        newStatus[dancer] = {};
        Object.keys(preParts).forEach((part) => {
            const preVal = preParts[part];
            const nextVal = nextParts[part];
            // LED Parts
            if (preVal.alpha !== undefined && nextVal.alpha !== undefined) {
                newStatus[dancer][part] = {
                    alpha: Round1(((nextVal.alpha - preVal.alpha) * (time - preTime)) /
                        (nextTime - preTime) +
                        preVal.alpha),
                    src: preVal.src,
                };
            }
            // El Parts
            else {
                newStatus[dancer][part] = Round1(((nextVal - preVal) * (time - preTime)) / (nextTime - preTime) +
                    preVal);
            }
        });
    });
    return newStatus;
}
exports.fadeStatus = fadeStatus;
