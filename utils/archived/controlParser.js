/**
 * Usage: node parser.js <path_to_control.json> <ouput_path_to_control.json>
 */
const fs = require("fs");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: controlTransform.js
if (args.length < 4) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}

const originalFilePath = args[2];
const outputFilePath = args[3];

const originalFile = fs.readFileSync(originalFilePath);
const originalData = JSON.parse(originalFile);

const outputData = {};
originalData.forEach((person, i) => {
  const name = `dancer${i.toString()}`;
  outputData[name] = [];
  person.forEach((timeSlice, j) => {
    const { Start, Status } = timeSlice;
    const newStatus = {};
    Object.keys(Status).forEach((partName) => {
      const part = Status[partName];
      if (typeof part === typeof {}) {
        newStatus[partName] = { src: part.name, alpha: part.alpha };
      } else {
        newStatus[partName] = part;
      }
    });
    outputData[name].push({ Start, Status: newStatus });
    // if (i === 0 && j === 0) console.log(name, i, j, Start, Status, newStatus);
  });
});
fs.writeFileSync(outputFilePath, JSON.stringify(outputData));
