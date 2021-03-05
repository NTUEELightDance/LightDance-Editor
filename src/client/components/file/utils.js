/* eslint-disable no-console */
// import store
import store from "../../store";

export const uploadJson = (files) => {
  console.log(files);
  return new Promise((resolve, reject) => {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (res) => {
      resolve(JSON.parse(res.target.result));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

// start order strictly increasing && dancer parts exists in store.load.dancers.dancer0

export const checkControlJson = (control) => {
  if (!Array.isArray(control) || control.length === 0) {
    console.error("[Error] control not array or position is empty");
    return false;
  }
  return control.every((frame, frameIdx) => {
    if (typeof frame.start !== "number") {
      console.error(`[Error] "start" is not a number in frame ${frameIdx}`);
      return false;
    }
    if (typeof frame.fade !== "boolean") {
      console.error(`[Error] "fade" is not a boolean in frame ${frameIdx}`);
      return false;
    }
    if (!("status" in frame)) {
      console.error(`[Error] "status" is undefined in frame ${frameIdx}`);
      return false;
    }
    return Object.entries(frame.status).every(([dancerName, dancerStatus]) => {
      const partList = Object.keys(dancerStatus);
      const elParts = Object.keys(
        store.getState().load.dancers[dancerName]["ELPARTS"]
      );
      const ledParts = Object.keys(
        store.getState().load.dancers[dancerName]["LEDPARTS"]
      );

      return partList.every((part) => {
        // check EL Parts
        if (elParts.includes(part)) {
          // check elParts
          if (typeof dancerStatus[part] !== "number") {
            console.error(
              `[Error] frame ${frameIdx}, ${dancerName}'s ${part} is not a number`
            );
            return false;
          }
          return true;
        }
        if (ledParts.includes(part)) {
          // check ledparts
          const { src, alpha } = dancerStatus[part];
          if (typeof src !== "string" || src.length === 0) {
            console.error(
              `[Error] frame ${frameIdx}, ${dancerName}'s ${part}'s src is invalid`
            );
            return false;
          }
          if (typeof alpha !== "number") {
            console.error(
              `[Error] frame ${frameIdx}, ${dancerName}'s ${part}'s alpha is not a number`
            );
            return false;
          }
          return true;
        }
        console.error(
          `[Error]  frame ${frameIdx}, ${dancerName}'s ${part} should not exist`
        );
        return false;
      });
    });
  });
};
export const checkPosJson = (position) => {
  if (!Array.isArray(position) || position.length === 0) {
    console.error("[Error] position not array or position is empty");
    return false;
  }
  return position.every((frame, frameIdx) => {
    if (!("start" in frame)) {
      console.error(`[Error] "start" is undefined in frame ${frameIdx}`);
      return false;
    }
    if (!("pos" in frame)) {
      console.error(`[Error] "pos" is undefined in frame ${frameIdx}`);
      return false;
    }
    return Object.entries(frame.pos).every(([dancerName, { x, y, z }]) => {
      if (
        typeof x !== "number" ||
        typeof y !== "number" ||
        typeof z !== "number"
      ) {
        console.error(
          `[Error] x, y, z not number in frame ${frameIdx} and dancer ${dancerName}`
        );
        return false;
      }
      return true;
    });
  });
};
