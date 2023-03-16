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
    color: oldExport.color,
    LEDEffects: oldExport.LEDEffects,
  };

  console.log(JSON.stringify(newExport));
}

function convertDancerData(oldDancerData, referenceDancerData) {
  const newDancerData = [
    ...referenceDancerData.filter(
      (dancer) => !oldDancerData.map((d) => d.name).includes(dancer.name)
    ),
    ...oldDancerData,
  ];

  return newDancerData;
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

function convertControlStatus(oldControlStatus, newDancerData) {
  const newPartData = newDancerData[0].parts.map((part) => {
    if (part.type === "LED") return ["", 0];
    if (part.type === "FIBER") return ["black", 0];
    throw new Error("Invalid part type");
  });

  const newControlStatus = [newPartData, ...oldControlStatus];

  return newControlStatus;
}

function convertPositionData(oldPositionData) {
  const newPositionData = {};

  for (const [frameID, oldPosFrame] of Object.entries(oldPositionData)) {
    newPositionData[frameID] = {
      ...oldPosFrame,
      pos: [[-15, 0, -10], ...oldPosFrame.pos],
    };
  }

  return newPositionData;
}

function cwd(relativePath) {
  if (!relativePath) return path.resolve(__dirname);

  if (relativePath.startsWith("/")) return relativePath;

  return path.resolve(__dirname, relativePath);
}
