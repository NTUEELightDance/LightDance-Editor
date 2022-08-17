// node bindLEDeffects.js ~/Downloads/0327_first.json ~/Downloads/LED_20220327_1857.json ../others/lightConfigFiles/LEDconfig.yaml ~/Downloads/0327_first_with_LED.json ~/Downloads/LED_0327_first.json

const fs = require("fs");
const { exit } = require("process");
const _ = require("lodash");
const yaml = require("js-yaml");
const path = require("path");

const dancerType = {
  "1_chi": "yellow",
  "2_meow": "yellow",
  "3_yeee": "yellow",
  "4_breaKing": "yellow",
  "5_itzyboo": "yellow",
  "6_yu": "cyan",
  "7_wang": "cyan",
  "8_hao": "cyan",
  "9_monkey": "cyan",
  "10_dontstop": "cyan",
  "11_wish": "magenta",
};

// Read Argument
const args = process.argv;
if (args.length < 5) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const inputPath = args[2];
const LEDExportPath = args[3];
const LEDConfigPath = args[4];
const outputPath = args[5];
const LEDoutputPath = args[6];

// get input file
console.log("Reading file from ... ", inputPath);
let inputFile = null;
try {
  inputFile = JSON.parse(fs.readFileSync(inputPath));
} catch (err) {
  console.error(`[Error] Can't open file ${inputPath}`);
  exit();
}

console.log("Reading file from ... ", LEDExportPath);
let LEDExportFile = null;
try {
  LEDExportFile = JSON.parse(fs.readFileSync(LEDExportPath));
} catch (err) {
  console.error(`[Error] Can't open file ${LEDExportPath}`);
  exit();
}

console.log("Reading file from ... ", LEDConfigPath);
let LEDConfigFile = null;
try {
  const fileExt = path.extname(LEDConfigPath);
  if (fileExt === ".yaml" || fileExt === ".yml")
    LEDConfigFile = yaml.load(fs.readFileSync(LEDConfigPath));
  else if (fileExt === ".json")
    LEDConfigFile = JSON.parse(fs.readFileSync(LEDConfigPath));
  else throw new Error();
} catch (err) {
  console.error(`[Error] Can't open file ${LEDConfigPath}`);
  throw err;
}

const {
  position: POSITION,
  control: originalControl,
  dancer: DANCER,
  color: COLOR,
} = inputFile;

const { intervals, bindings } = LEDConfigFile;

const generateLEDEffect = (partName, effectName, len, colorCode, alpha) => {
  if (!LEDExportFile[partName]) LEDExportFile[partName] = {};
  const repeat = 0;
  const effect = [];
  for (let i = 0; i < len; i++) {
    effect.push({
      alpha,
      colorCode,
    });
  }
  const effects = [
    {
      effect,
      start: 0,
      fade: false,
    },
  ];
  LEDExportFile[partName][effectName] = { repeat, effects };
};

const isInIntervals = (time, intervals) => {
  for (const [start, end] of intervals) {
    if (time >= start && time < end) return true;
  }
  return false;
};

const CONTROL = {};
Object.entries(originalControl).forEach(([frameKey, value]) => {
  const { status, start } = value;
  const newStatus = _.cloneDeep(status);

  if (isInIntervals(start, intervals)) {
    Object.entries(status).forEach(([dancerName, dancerStatus]) => {
      const currentBinding = bindings[dancerType[dancerName]];
      Object.keys(dancerStatus).forEach((partName) => {
        if (partName in currentBinding) {
          const { alpha: rawAlpha, color: colorName } =
            dancerStatus[currentBinding[partName]];
          const alpha = rawAlpha > 5 ? 10 : 0;
          const colorCode = COLOR[colorName];
          const len = 37;
          const effectName =
            alpha <= 1 ? `black_${len}` : `${colorName}_${len}_${alpha}`;
          if (!LEDExportFile[partName]) LEDExportFile[partName] = {};
          if (!(effectName in LEDExportFile[partName])) {
            generateLEDEffect(partName, effectName, len, colorCode, alpha);
          }
          newStatus[dancerName][partName].src = effectName;
        }
      });
    });
  }

  CONTROL[frameKey] = { ...value, status: newStatus };
});

const outputFile = {
  position: POSITION,
  control: CONTROL,
  dancer: DANCER,
  color: COLOR,
};

const LEDoutputFile = { ...LEDExportFile };

fs.writeFile(outputPath, JSON.stringify(outputFile), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});

fs.writeFile(LEDoutputPath, JSON.stringify(LEDoutputFile), () => {
  console.log(`Writing new file to ... ${LEDoutputPath}`);
});
