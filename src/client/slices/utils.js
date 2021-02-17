const binarySearchFrame = (data, time) => {
  let l = 0;
  let r = data["player0"].length - 1;
  let m = Math.floor((l + r + 1) / 2);
  while (l < r) {
    if (data["player0"][m].Start <= time) l = m;
    else r = m - 1;
    m = Math.floor((l + r + 1) / 2);
  }
  return m;
};

/**
 * Update Frame Index By Time
 * @param {object} data - control
 * @param {object} frame - frame idx
 * @param {object} time - timestamp
 */
const updateFrameByTime = (data, frame, time) => {
  // Check if need to do binarysearch
  if (
    data["player0"][frame + 2] &&
    time >= data["player0"][frame + 1].Start &&
    time <= data["player0"][frame + 2].Start
  ) {
    return frame + 1;
  }
  return binarySearchFrame(data, time);
};

export default updateFrameByTime;
