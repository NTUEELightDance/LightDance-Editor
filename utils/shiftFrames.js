const fs = require('fs');
const path = require('path');

const data = require("./saber.json");

startTime = 336007;
endTime = 6000000;
shift = 12857;

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

startTime = 215928;
endTime = 336007;
shift = 10050;

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

startTime = 157289;
endTime = 215928;
shift = 7294;

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

startTime = 98125;
endTime = 157289;
shift = 3750;

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

fs.writeFileSync(path.join(__dirname, "./shifted.json"), JSON.stringify(data, null, 0));
console.log("saved to ./shifted.json")