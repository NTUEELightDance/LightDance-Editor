const fs = require('fs');
const path = require('path');

const data = require("../backup/2025.03.14.json");

const startTime = 47396;
const endTime = 61912;

for (const key of Object.keys(data.control)) {
    if (data.control[key].start > startTime && data.control[key].start < endTime) {
        delete data.control[key];
    }
}

for (const key of Object.keys(data.position)) {
    if (data.position[key].start > startTime && data.position[key].start < endTime) {
        delete data.position[key];
    }
}

fs.writeFileSync(path.join(__dirname, "jsons/exportDataEmptyNew.json"), JSON.stringify(data, null, 2));