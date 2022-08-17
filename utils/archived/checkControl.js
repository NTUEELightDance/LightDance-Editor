/**
 * Usage: node checkControl.js <path_to_position.json>
 */
const ELPARTS = {
  HAT1: {
    zIndex: 5,
    width: 144.796,
    height: 53.565,
    x: 93.059,
    y: 17.762999999999998,
  },
  HAT2: {
    zIndex: 5,
    width: 125.623,
    height: 43.644,
    x: 102.643,
    y: 22.732999999999997,
  },
  FACE1: {
    zIndex: 5,
    width: 90.025,
    height: 119.19,
    x: 119.374,
    y: 74.57,
  },
  FACE2: {
    zIndex: 5,
    width: 67.836,
    height: 109.536,
    x: 130.331,
    y: 78.42,
  },
  INNER1: {
    zIndex: 6,
    width: 123.095,
    height: 224.089,
    x: 105.72300000000001,
    y: 190.245,
  },
  INNER2: {
    zIndex: 5,
    width: 125.794,
    height: 220.319,
    x: 101.917,
    y: 198.034,
  },
  L_COAT1: {
    zIndex: 10,
    width: 56.729,
    height: 231.426,
    x: 196.825,
    y: 192.207,
  },
  L_COAT2: {
    zIndex: 10,
    width: 44.446,
    height: 220.834,
    x: 202.12099999999998,
    y: 197.875,
  },
  R_COAT1: {
    zIndex: 10,
    width: 56.729,
    height: 231.426,
    x: 77.35900000000001,
    y: 192.579,
  },
  R_COAT2: {
    zIndex: 10,
    width: 44.446,
    height: 220.834,
    x: 84.346,
    y: 198.247,
  },
  L_ARM1: {
    zIndex: 10,
    width: 64.301,
    height: 207.701,
    x: 248.92000000000002,
    y: 215.93200000000002,
  },
  L_ARM2: {
    zIndex: 10,
    width: 54.241,
    height: 194.691,
    x: 253.70999999999998,
    y: 223.361,
  },
  R_ARM1: {
    zIndex: 10,
    width: 64.301,
    height: 207.701,
    x: 17.691000000000003,
    y: 216.30399999999997,
  },
  R_ARM2: {
    zIndex: 10,
    width: 54.241,
    height: 194.619,
    x: 22.962000000000003,
    y: 223.73399999999998,
  },
  L_HAND: {
    zIndex: 10,
    width: 37.956,
    height: 39.872,
    x: 273.048,
    y: 423.819,
  },
  R_HAND: {
    zIndex: 10,
    width: 37.956,
    height: 39.872,
    x: 16.617999999999995,
    y: 423.819,
  },
  L_PANTS1: {
    zIndex: 5,
    width: 82.031,
    height: 178.079,
    x: 164.316,
    y: 410.713,
  },
  L_PANTS2: {
    zIndex: 5,
    width: 77.526,
    height: 168.138,
    x: 164.306,
    y: 415.683,
  },
  R_PANTS1: {
    zIndex: 5,
    width: 82.052,
    height: 178.079,
    x: 82.42500000000001,
    y: 410.713,
  },
  R_PANTS2: {
    zIndex: 5,
    width: 77.536,
    height: 168.138,
    x: 86.941,
    y: 415.683,
  },
  L_SHOES1: {
    zIndex: 10,
    width: 78.989,
    height: 44.117,
    x: 207.20100000000002,
    y: 596.139,
  },
  R_SHOES1: {
    zIndex: 10,
    width: 78.989,
    height: 44.117,
    x: 46.68100000000001,
    y: 596.139,
  },
  L_SHOES2: {},
  R_SHOES2: {},
};

const LEDPARTS = {
  LED_CHEST: {
    zIndex: 3,
    width: 92.682,
    height: 217.681,
    x: 117.965,
    y: 198.832,
  },
  LED_R_SHOE: {
    zIndex: 10,
    width: 92.609,
    height: 7.967,
    x: 39.879000000000005,
    y: 644.524,
  },
  LED_L_SHOE: {
    zIndex: 10,
    width: 92.609,
    height: 7.967,
    x: 200.043,
    y: 644.524,
  },
  LED_FAN: {
    zIndex: 10,
    width: 88.548,
    height: 72.531,
    x: -19.43,
    y: 476.08500000000004,
  },
};

const checkControlJson = (control) => {
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
      // const elParts = Object.keys(
      //   store.getState().load.dancers[dancerName]["ELPARTS"]
      // );
      // const ledParts = Object.keys(
      //   store.getState().load.dancers[dancerName]["LEDPARTS"]
      // );
      const elParts = Object.keys(ELPARTS);
      const ledParts = Object.keys(LEDPARTS);

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

const fs = require("fs");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: controlTransform.js
if (args.length < 3) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const inputPath = args[2];

// Read File
console.log("Reading json from ... ", inputPath);
let raw = null;
try {
  raw = fs.readFileSync(inputPath);
} catch (err) {
  console.error(`[Error] Can't open file ${inputPath}`);
  exit();
}
const control = JSON.parse(raw);
const checkResult = checkControlJson(control);

if (checkResult) console.log("Check Success !!!");
else console.log("Check Failed !");
