const fs = require("fs");
const path = require("path");

main();

async function main() {
  const oldExportPath = process.argv[2];
  const oldExport = JSON.parse(fs.readFileSync(oldExportPath, "utf8"));

  const tmpFile = require("tmp").fileSync({ postfix: ".json" }).name;

  const cmdArguments = [
    "generateInitialExport.js",
    "../files/data/load.json",
    "../files/",
  ].map(cwd);

  // execute the command and redirect the output to the tmp file
  require("child_process").execFileSync(
    "node",
    cmdArguments,
    {
      stdio: ["ignore", fs.openSync(tmpFile, "w"), "ignore"],
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
  );

  // read the tmp file
  const referenceExport = JSON.parse(fs.readFileSync(tmpFile, "utf8"));

  const oldDancerData = oldExport.dancer;
  const newDancerData = convertDancerData(
    oldDancerData,
    referenceExport.dancer
  );

  const newExport = {
    dancer: newDancerData,
    control: convertControlData(
      oldExport.control,
      newDancerData,
      oldDancerData
    ),
    position: convertPositionData(
      oldExport.position,
      newDancerData,
      oldDancerData
    ),
    color: convertColorData(oldExport.color, newDancerData, oldDancerData),
    LEDEffects: {},
  };

  console.log(JSON.stringify(newExport));
}

function convertDancerData(oldDancerData, referenceDancerData) {
  const newDancerData = [
    ...oldDancerData.map((oldDancer, index) => {
      const referenceDancer = referenceDancerData[index];
      return {
        ...oldDancer,
        parts: convertDancerParts(oldDancer.parts, referenceDancer.parts),
      };
    }),
    ...referenceDancerData.filter(
      (dancer) => !oldDancerData.map((d) => d.name).includes(dancer.name)
    ),
  ];

  return newDancerData;
}

function convertDancerParts(oldDancerParts, referenceDancerParts) {
  const oldPartNames = oldDancerParts.map((part) => part.name);
  const newDancerParts = [
    ...oldDancerParts,
    ...referenceDancerParts.filter((part) => !oldPartNames.includes(part.name)),
  ];

  return newDancerParts;
}

function convertControlData(oldControlData, newDancerData, oldDancerData) {
  const newControlData = {};

  for (const [frameID, oldControlFrame] of Object.entries(oldControlData)) {
    const newControlFrame = {
      ...oldControlFrame,
      status: convertControlStatus(
        oldControlFrame.status,
        newDancerData,
        oldDancerData
      ),
    };

    newControlData[frameID] = newControlFrame;
  }

  return newControlData;
}

function convertControlStatus(oldControlStatus, newDancerData, oldDancerData) {
  const generateFillerData = (dancerIndex) => {
    // new parts are those not existing in the old data
    const newParts = newDancerData[dancerIndex].parts.filter((part) =>
      oldDancerData[dancerIndex]
        ? !oldDancerData[dancerIndex].parts.includes(part)
        : true
    );

    const newPartData = newParts.map((part) => {
      if (part.type === "LED") return ["", 0];
      if (part.type === "FIBER") return ["black", 0];
      throw new Error("Invalid part type");
    });

    return newPartData;
  };

  const newControlStatus = [];

  for (let i = 0; i < newDancerData.length; i++) {
    const newDancerStatus = [
      ...(oldControlStatus[i] ?? []),
      ...generateFillerData(i),
    ];

    newControlStatus.push(newDancerStatus);
  }

  return newControlStatus;
}

function convertPositionData(oldPositionData, newDancerData, oldDancerData) {
  const newPositionData = {};

  const fillerData = Array(newDancerData.length - oldDancerData.length)
    .fill(null)
    .map((_, index) => [index - 20, 0, -10]);

  for (const [frameID, oldPosFrame] of Object.entries(oldPositionData)) {
    newPositionData[frameID] = {
      ...oldPosFrame,
      pos: [...oldPosFrame.pos, ...fillerData],
    };
  }

  return newPositionData;
}

function convertColorData(oldColorData) {
  const newColorData = {};

  for (const [colorName, colorValue] of Object.entries(oldColorData)) {
    newColorData[colorName] = hexToRGB(colorValue);
  }

  return newColorData;
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function cwd(relativePath) {
  if (!relativePath) return path.resolve(__dirname);

  if (relativePath.startsWith("/")) return relativePath;

  return path.resolve(__dirname, relativePath);
}
