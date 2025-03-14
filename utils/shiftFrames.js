const fs = require('fs');
const path = require('path');

const data = require("../backup/2025.03.14.json");

const startTime = 61912;
const endTime = 6000000000;
const shift = -14516;

for (const key of Object.keys(data.control)) {
    if (data.control[key].start > startTime && data.control[key].start < endTime) {
        data.control[key].start += shift;
    }
}

for (const key of Object.keys(data.position)) {
    if (data.position[key].start > startTime && data.position[key].start < endTime) {
        data.position[key].start += shift;
    }
}

fs.writeFileSync(path.join(__dirname, "jsons/exportDataEmptyNew.json"), JSON.stringify(data, null, 2));