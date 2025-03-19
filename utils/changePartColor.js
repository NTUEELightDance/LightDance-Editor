const fs = require('fs');
const path = require('path');

// const data = require("./../../LightTableBackup/2025.03.17.json");
const data = require("./jsons/exportDataEmpty.json");

const updateFrameForDancer = (key, frame, partLength, LEDColor, index, LEDindex) => {
    const status = JSON.parse(JSON.stringify(frame.status)); 
    const led_status = JSON.parse(JSON.stringify(frame.led_status)); 

    for (let i = 0; i < DancerLength; i++) {
        led_status[index][i] = []
        if (status[index][LEDindex][0] === "good_pink" || status[index][LEDindex][0] === "peach_pink") {
            status[index][LEDindex][0] = "sky_blue";
        }
        if (status[index][LEDindex][0] === "good_Purple") {
            status[index][LEDindex][0] = "light_blue";
        }
    }

    const controlData = {
        ...frame,
        status,
        led_status,
    };

    data.control[key] = controlData;
}

const editDancerPart = (start, end, LEDColor, index, LEDindex) => {
    const existingFrames = Object.keys(data.control).filter((key) => data.control[key].start >= start && data.control[key].start <= end);
    existingFrames.forEach((key) => {
        updateFrameForDancer(key, data.control[key], partLength, LEDColor, index, LEDindex);
    });
}

let startTime = 0;
let endTime = 5000000;
let dancerName = "8_how";
let LEDPart = "mask_LED";
let LEDColor = ["black", 100];

let DancerLength = data.dancer.find(d => d.name === dancerName).parts.length;
let partLength = data.dancer.find(d => d.name === dancerName).parts.find(d => d.name === LEDPart).length;
let index = data.dancer.findIndex(d => d.name === dancerName);
let LEDindex = data.dancer[index].parts.findIndex(d => d.name === LEDPart);

editDancerPart(startTime, endTime, LEDColor, index, LEDindex);

// fs.writeFileSync(path.join(__dirname, "./../../LightTableBackup/2025.03.17.json"), JSON.stringify(data, null, 0));
fs.writeFileSync(path.join(__dirname, "./jsons/exportDataEmptyNew.json"), JSON.stringify(data, null, 2));

console.log("Updated data has been saved to ./jsons/exportDataEmptyNew.json");