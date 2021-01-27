const fs = require("fs");
const { output } = require("../config/webpack.common");

const originalFilePath = __dirname + "/../data/control.json";
const outputFilePath = __dirname + "/../data/new_control.json";
console.log(originalFilePath);

const originalFile = fs.readFileSync(originalFilePath);
const originalData = JSON.parse(originalFile);

const firstPerson = originalData[0];
// console.log(originalData);s

const outputData = {};
originalData.forEach((person, i) => {
  const name = "player" + i.toString();
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
console.log(outputData["player0"][0]);
// console.log(firstPerson[Object.keys(firstPerson)[0]]);
