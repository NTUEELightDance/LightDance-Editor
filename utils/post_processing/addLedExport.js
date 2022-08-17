const dancerType = {
  "1_henning": "yellow",
  "2_hans": "yellow",
};

const fs = require("fs");
const { stat } = require("fs/promises");
const { exit } = require("process");
const _ = require("lodash");

// Read Argument
const args = process.argv;
if (args.length < 4) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const exportDataPath = args[2];
const LEDDataPAth = args[3];
const exportOutputPath = args[4];
const LEDOutputPath = args[5];

// get input file
console.log("Reading json from ... ", exportDataPath);
let exportRaw = null;
try {
  exportRaw = fs.readFileSync(exportDataPath);
} catch (err) {
  console.error(`[Error] Can't open file ${exportDataPath}`);
  exit();
}

console.log("Reading json from ... ", LEDDataPAth);
let ledRaw = null;
try {
  ledRaw = fs.readFileSync(LEDDataPAth);
} catch (err) {
  console.error(`[Error] Can't open file ${LEDDataPAth}`);
  exit();
}

let dancerConfig = null;
try {
  dancerConfig = fs.readFileSync('data/1_henning.json');
} catch (err) {
  console.error(`[Error] Can't open file ${'data/1_henning.json'}`);
  exit();
}

const {
  position: originalPosition,
  control: originalControl,
  dancer: DANCER,
  color: COLOR,
} = JSON.parse(exportRaw);

COLOR.black = "#000000";

const { LEDPARTS: ledConfig } = JSON.parse(dancerConfig)

const LEDeffects = JSON.parse(ledRaw)

const ledIsOn = (time) => {
  const time2ms = (time) => {
    const [min, second, ms] = time.split(":");
    return (parseInt(min, 10) * 60 + parseInt(second, 10)) * 1000 + parseInt(ms, 10)
  }

  const ledOnIntervals = [
    [time2ms("0:56:566"), time2ms("0:56:568")],
    [time2ms("1:01:646"), time2ms("1:13:229")],
    [time2ms("1:27:664"), time2ms("1:29:477")]
  ]

  for (const [start, end] of ledOnIntervals) {
    if (time >= start && time <= end) {
      return true
    }
  }

  return false
}

const generateLEDeffect = (partName, color) => {
  if (!(color in COLOR)) {
    color = "black"
  }

  const { len } = ledConfig[partName];
  const effectName = `${color}_${len}`;

  const effect = [];

  for (let i = 0; i < len; i++) {
    effect.push({
      alpha: 10,
      colorCode: COLOR[color]
    })
  }

  LEDeffects[partName][effectName] = {
    repeat: 0,
    effects: [
      {
        effect,
        start: 0,
        fade: false
      }
    ]
  }

  return effectName;
}

const CONTROL = {};
Object.entries(originalControl).forEach(([frameKey, value]) => {
  const newStatus = {};
  const { start: time } = value

  Object.entries(value.status).forEach(([dancerName, dancerStatus]) => {
    newStatus[dancerName] = {};
    Object.entries(dancerStatus).forEach(([partName, partStatus]) => {

      newStatus[dancerName][partName] = partStatus;

      if (partName.endsWith('LED')) {
        if (partName.startsWith('Hand')) {
          if (ledIsOn(time)) {
            console.log('updated', partName);
            newStatus[dancerName][partName] = {
              src: generateLEDeffect(partName, dancerStatus['Arm_L'].color),
              alpha: 10
            };
          } else {
            newStatus[dancerName][partName] = {
              src: generateLEDeffect(partName, 'black'),
              alpha: 10
            };
          }
        } else if (partStatus?.src !== "") {
          console.log('cleaned', partName);
          newStatus[dancerName][partName] = {
            src: "",
            alpha: 0
          };
        }
      }

      if (
        newStatus[dancerName][partName].color &&
        !(newStatus[dancerName][partName].color in COLOR)
      ) {
        newStatus[dancerName][partName].color = "black";
      }

    });
  });

  CONTROL[frameKey] = { ...value, status: newStatus };
});

const exportJSON = {
  position: originalPosition,
  control: CONTROL,
  dancer: DANCER,
  color: COLOR,
};

fs.writeFile(exportOutputPath, JSON.stringify(exportJSON), () => {
  console.log(`Writing new file to ... ${exportOutputPath}`);
});

fs.writeFile(LEDOutputPath, JSON.stringify(LEDeffects), () => {
  console.log(`Writing new file to ... ${LEDOutputPath}`);
})