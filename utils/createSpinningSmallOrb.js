const fs = require('fs');
const path = require('path');

// const data = require("./../../LightTableBackup/2025.03.17.json");
const data = require("./jsons/exportDataEmpty.json");

const addFrame = (start, partLength, defaultColorData, secondaryColorData, direction, double, index, LEDindex) => {
    const previousControl = Object.values(data.control)
        .filter(d => d.start <= start)
        .reduce((prev, curr) => (curr.start > prev.start ? curr : prev), { start: -Infinity });
    const status = JSON.parse(JSON.stringify(previousControl.status)); 
    const led_status = JSON.parse(JSON.stringify(previousControl.led_status)); 

    status[index][LEDindex] = ["", 150];
    led_status[index][LEDindex] = Array(partLength).fill(defaultColorData);

    for (let i = (start - startTime) * partLength / period; i < (start - startTime) * partLength / period + LEDlength; i++) {
        const bulbIndex = ((direction * Math.round(i)) % partLength + partLength) % partLength
        led_status[index][LEDindex][bulbIndex] = secondaryColorData;
        if (double) {
            led_status[index][LEDindex][(bulbIndex + partLength / 2) % partLength] = secondaryColorData;
        }   
    }
    
    const controlData = {
        start,
        fade: previousControl.fade,
        status,
        led_status,
    };

    const entry = Object.entries(data.control).find(([_, value]) => value.start == start);
    if (entry) {
        const [key, _] = entry;
        data.control[key] = controlData;
        return;
    }

    const maxKey = Math.max(...Object.keys(data.control).map(Number));
    const nextKey = maxKey + 1;
    data.control[nextKey.toString()] = controlData;
}

const updateFrame = (key, frame, partLength, defaultColorData, secondaryColorData, direction, double, index, LEDindex) => {
    const start = frame.start;
    const status = JSON.parse(JSON.stringify(frame.status)); 
    const led_status = JSON.parse(JSON.stringify(frame.led_status)); 

    status[index][LEDindex] = ["", 150];
    led_status[index][LEDindex] = Array(partLength).fill(defaultColorData);

    for (let i = (start - startTime) * partLength / period; i < (start - startTime) * partLength / period + LEDlength; i++) {
        const bulbIndex = ((direction * Math.round(i)) % partLength + partLength) % partLength
        led_status[index][LEDindex][bulbIndex] = secondaryColorData;
        if (double) {
            led_status[index][LEDindex][(bulbIndex + partLength / 2) % partLength] = secondaryColorData;
        }   
    }
    
    const controlData = {
        ...frame,
        status,
        led_status,
    };

    data.control[key] = controlData;
}

const createSpinner = (start, end, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex) => {
    for (let t = start; t < end; t += (period / partLength * LEDlength)) {
        addFrame(Math.round(t), partLength, defaultColorData, secondaryColorData, direction, double, index, LEDindex);
    }

    const existingFrames = Object.keys(data.control).filter((key) => data.control[key].start >= start && data.control[key].start <= end);
    existingFrames.forEach((key) => {
        updateFrame(key, data.control[key], partLength, defaultColorData, secondaryColorData, direction, double, index, LEDindex);
    });
}

let startTime = 48318;
let endTime = 61912;
let period = 937;
let LEDlength = 12;
let PropName = "11_small_orb_1";
let LEDPart = "main_LED";
let defaultColorData = ["blue", 255];
let secondaryColorData = ["red", 255];
let direction = 1;
let double = true;

let partLength = data.dancer.find(d => d.name === PropName).parts.find(d => d.name === LEDPart).length;
let index = data.dancer.findIndex(d => d.name === PropName);
let LEDindex = data.dancer[index].parts.findIndex(d => d.name === LEDPart);

createSpinner(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);

startTime = 49302;
endTime = 61912;
period = 937;
LEDlength = 12;
PropName = "12_small_orb_2";
LEDPart = "main_LED";
defaultColorData = ["blue", 255];
secondaryColorData = ["red", 255];
direction = -1;
double = true;

partLength = data.dancer.find(d => d.name === PropName).parts.find(d => d.name === LEDPart).length;
index = data.dancer.findIndex(d => d.name === PropName);
LEDindex = data.dancer[index].parts.findIndex(d => d.name === LEDPart);

createSpinner(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);

startTime = 343522;
endTime = 346522;
period = 1000;
LEDlength = 12;
PropName = "11_small_orb_1";
LEDPart = "main_LED";
defaultColorData = ["blue", 255];
secondaryColorData = ["red", 255];
direction = -1;
double = true;

partLength = data.dancer.find(d => d.name === PropName).parts.find(d => d.name === LEDPart).length;
index = data.dancer.findIndex(d => d.name === PropName);
LEDindex = data.dancer[index].parts.findIndex(d => d.name === LEDPart);

createSpinner(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);

startTime = 343522;
endTime = 346522;
period = 1000;
LEDlength = 12;
PropName = "12_small_orb_2";
LEDPart = "main_LED";
defaultColorData = ["blue", 255];
secondaryColorData = ["red", 255];
direction = 1;
double = true;

partLength = data.dancer.find(d => d.name === PropName).parts.find(d => d.name === LEDPart).length;
index = data.dancer.findIndex(d => d.name === PropName);
LEDindex = data.dancer[index].parts.findIndex(d => d.name === LEDPart);

createSpinner(startTime, endTime, period, LEDlength, defaultColorData, secondaryColorData, direction, double, partLength, index, LEDindex);


// fs.writeFileSync(path.join(__dirname, "./../../LightTableBackup/2025.03.17.json"), JSON.stringify(data, null, 0));
fs.writeFileSync(path.join(__dirname, "./jsons/exportDataEmptyNew.json"), JSON.stringify(data, null, 0));

console.log("Updated data has been saved to ./jsons/exportDataEmptyNew.json");