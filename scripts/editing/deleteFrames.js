const fs = require('fs');
const path = require('path');

const data = require("../../../LightTableBackup/2025.03.23.json");
console.log(Object.keys(data.control).length)
const startTime = 426000;
const endTime = 433625;

for (const key of Object.keys(data.control)) {
    if (data.control[key].start > startTime && data.control[key].start < endTime) {
        delete data.control[key];
    }
}

// for (const key of Object.keys(data.position)) {
//     if (data.position[key].start > startTime && data.position[key].start < endTime) {
//         delete data.position[key];
//     }
// }

console.log(Object.keys(data.control).length)

fs.writeFileSync(path.join(__dirname, "./deleted.json"), JSON.stringify(data, null, 0));