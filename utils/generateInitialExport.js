const fs = require("fs");
const path = require("path");
const { NodeIO } = require("@gltf-transform/core");

const BLACK = "black";
const BLACK_HEX = "#000000";
const WHITE = "white";
const WHITE_HEX = "#ffffff";
const RED = "red";
const RED_HEX = "#ff0000";
const GREEN = "green";
const GREEN_HEX = "#00ff00";
const BLUE = "blue";
const BLUE_HEX = "#0000ff";
const ALL_BLACK = "all_black";
const ALL_WHITE = "all_white";
const ALL_RED = "all_red";
const ALL_GREEN = "all_green";
const ALL_BLUE = "all_blue";
const NO_EFFECT = "";

const partNameIgnore = new Set(["Human"]);

const io = new NodeIO();

const modelPartNameCache = new Map();

async function getParts(modelPath) {
  if (modelPartNameCache.has(modelPath)) {
    return modelPartNameCache.get(modelPath);
  }

  const document = await io.read(modelPath); // → Document
  const root = document.getRoot();
  const partNames = root
    .listNodes()
    .map((node) => node.getName())
    // drop after '.'
    .map((name) => name.split(".")[0])
    // remove duplicates
    .filter((name, index, self) => self.indexOf(name) === index)
    // remove ignored names
    .filter((name) => !partNameIgnore.has(name));

  const parts = partNames.map((partName) => ({
    name: partName,
    type: partName.split("_").pop() === "LED" ? "LED" : "FIBER",
  }));

  const LEDs = root
    .listNodes()
    .map((node) => node.getName())
    .filter((name) => name.includes("_LED."));

  const LEDcounter = LEDs.reduce((acc, LEDname) => {
    const partName = LEDname.split(".")[0];
    acc[partName] |= 0;
    acc[partName] += 1;
    return acc;
  }, {});

  Object.entries(LEDcounter).forEach(([partName, length]) => {
    const part = parts.find((part) => part.name === partName);
    if (!part) {
      throw new Error(`part ${partName} not found`);
    }
    part.length = length;
  });

  modelPartNameCache.set(modelPath, parts);

  return parts;
}

function toGlbPath(dracoPath) {
  if (!dracoPath.endsWith(".draco.glb")) {
    throw new Error("not using draco glb in dancer map");
  }
  return dracoPath.replace(".draco.glb", ".glb");
}

function generateEmptyControlFrame(dancerData, start, color, effect) {
  const status = dancerData.map(({ parts }) =>
    parts.map(({ type }) => {
      if (type === "LED") {
        return [effect, 0];
      } else if (type === "FIBER") {
        return [color, 0];
      } else {
        throw new Error(`unknown type: ${type}`);
      }
    })
  );

  return {
    fade: false,
    start: 0,
    status,
  };
}

function generateEmptyPosMap(dancerData) {
  const length = dancerData.length;
  const spacing = 3;
  const pos = dancerData.map((val, index) => [
    (index - (length - 1) / 2) * spacing,
    0,
    0,
  ]);

  return {
    start: 0,
    pos,
  };
}

function generateDefaultEffect(length, color) {
  const LEDs = [];
  for (let i = 0; i < length; i++) {
    if (color.length !== 3 && color.length !== 4) {
      throw new Error("color should be an array of 3 or 4 numbers");
    }
    if (color.length === 3) {
      color.push(10);
    }
    LEDs.push(color);
  }
  return {
    repeat: 0,
    frames: [
      {
        start: 0,
        fade: false,
        LEDs,
      },
    ],
  };
}

function generateEmptyLEDEffects(dancerData) {
  const LEDparts = [];
  dancerData.forEach(({ parts }) => {
    parts.forEach((part) => {
      if (part.type === "LED") {
        LEDparts.push(part);
      }
    });
  });

  const effects = LEDparts.reduce((acc, part) => {
    return {
      ...acc,
      [part.name]: {
        [ALL_BLACK]: generateDefaultEffect(part.length, [0, 0, 0, 0]),
        [ALL_WHITE]: generateDefaultEffect(part.length, [255, 255, 255, 10]),
        [ALL_RED]: generateDefaultEffect(part.length, [255, 0, 0, 10]),
        [ALL_GREEN]: generateDefaultEffect(part.length, [0, 255, 0, 10]),
        [ALL_BLUE]: generateDefaultEffect(part.length, [0, 0, 255, 10]),
      },
    };
  }, {});

  return effects;
}

(async () => {
  const loadJsonPath = process.argv[2];
  const fileServerRoot = process.argv[3];

  // load the json file
  const loadJson = JSON.parse(fs.readFileSync(loadJsonPath, "utf8"));

  const dancerMap = loadJson["DancerMap"];

  // if dancerMap is not defined, throw an error
  if (!dancerMap) {
    throw new Error("DancerMap is not defined");
  }

  const dancerData = await Promise.all(
    Object.entries(dancerMap).map(async ([dancerName, { url }]) => {
      const modelUrl = toGlbPath(path.join(fileServerRoot, url));
      return {
        name: dancerName,
        parts: await getParts(modelUrl),
      };
    })
  );

  // sort by dancer name
  dancerData.sort(
    (a, b) => parseInt(a.name.split("_")[0]) - parseInt(b.name.split("_")[0])
  );

  const controlData = {
    0: generateEmptyControlFrame(dancerData, 4000, BLACK, NO_EFFECT),
    1: generateEmptyControlFrame(dancerData, 0, WHITE, ALL_WHITE),
    2: generateEmptyControlFrame(dancerData, 1000, RED, ALL_RED),
    3: generateEmptyControlFrame(dancerData, 2000, GREEN, ALL_GREEN),
    4: generateEmptyControlFrame(dancerData, 3000, BLUE, ALL_BLUE),
  };

  const positionData = {
    0: generateEmptyPosMap(dancerData),
  };

  const colorData = {
    [BLACK]: BLACK_HEX,
    [WHITE]: WHITE_HEX,
    [RED]: RED_HEX,
    [GREEN]: GREEN_HEX,
    [BLUE]: BLUE_HEX,
  };

  const LEDEffectsData = generateEmptyLEDEffects(dancerData);

  const exportData = {
    dancer: dancerData,
    control: controlData,
    position: positionData,
    color: colorData,
    LEDEffects: LEDEffectsData,
  };

  console.log(JSON.stringify(exportData, null, 2));
})();
