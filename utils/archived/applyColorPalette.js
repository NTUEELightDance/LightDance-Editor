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
  console.error(`[Error] Too few arguments !!!`);
  exit();
}
const inputPath = args[2];
const colorPalettePath = args[3];
const outputPath = args[4];

// get input file
console.log("Reading file from ... ", inputPath);
let inputFile = null;
try {
  inputFile = JSON.parse(fs.readFileSync(inputPath));
} catch (err) {
  console.error(`[Error] Can't open file ${inputPath}`);
  exit();
}

let colorPaletteFile = null;
try {
  const fileExt = path.extname(colorPalettePath);
  if (fileExt === ".yaml" || fileExt === ".yml")
    colorPaletteFile = yaml.load(fs.readFileSync(colorPalettePath));
  else if (fileExt === ".json")
    colorPaletteFile = JSON.parse(fs.readFileSync(colorPalettePath));
  else throw new Error();
} catch (err) {
  console.error(`[Error] Can't open file ${colorPalettePath}`);
  throw err;
}

const {
  position: POSITION,
  control: originalControl,
  dancer: DANCER,
  color: COLOR,
} = inputFile;

const { palettes, colors: paletteColors } = colorPaletteFile;

// fix colors
const newColors = _.cloneDeep(paletteColors);

const palleteColorCode2Name = {};
Object.entries(
  ([colorName, colorCode]) => (palleteColorCode2Name[colorCode] = colorName)
);

const colorNameMap = {};
for (const colorName in COLOR) {
  const colorCode = COLOR[colorName];
  if (colorCode in palleteColorCode2Name)
    colorNameMap[colorName] = palleteColorCode2Name[colorCode];
}

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

  let currentPaletteGroup = null;
  for (const paletteName in palettes) {
    const { intervals } = palettes[paletteName];
    if (isInIntervals(start, intervals)) {
      currentPaletteGroup = palettes[paletteName].paletteGroup;
      break;
    }
  }

  if (currentPaletteGroup) {
    Object.entries(status).forEach(([dancerName, dancerStatus]) => {
      const palette = currentPaletteGroup[dancerType[dancerName]];
      Object.keys(dancerStatus).forEach((partName) => {
        if (partName in palette) {
          newStatus[dancerName][partName].color = palette[partName];
        }
      });
    });
  }

  Object.entries(status).forEach(([dancerName, dancerStatus]) => {
    Object.entries(dancerStatus).forEach(([partName, { color: colorName }]) => {
      if (!colorName) return;
      if (colorName in colorNameMap) {
        newStatus[dancerName][partName].color = colorNameMap[colorName];
      } else if (colorName in COLOR) {
        newColors[colorName] = COLOR[colorName];
      }
    });
  });

  CONTROL[frameKey] = { ...value, status: newStatus };
});

const exportJSON = {
  position: POSITION,
  control: CONTROL,
  dancer: DANCER,
  color: newColors,
};

fs.writeFile(outputPath, JSON.stringify(exportJSON), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
