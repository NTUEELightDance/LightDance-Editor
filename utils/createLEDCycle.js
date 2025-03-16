const fs = require('fs');
const path = require('path');

const data = require("./jsons/exportDataEmpty.json");

const startTime = 6000;
const endTime = 16000;
const period = 1000;
const LEDlength = 6;
const PropName = "11_small_orb_1";
const LEDPart = "main_LED";
const defaultColorData = ["blue", 255];
const secondaryColorData = ["red", 255];

const partLength = data.dancer.find(d => d.name === PropName).parts.find(d => d.name === LEDPart).length;
const index = data.dancer.findIndex(d => d.name === PropName);
const LEDindex = data.dancer[index].parts.findIndex(d => d.name === LEDPart);

const addFrame = (t) => {
    const previousControl = Object.values(data.control)
        .filter(d => d.start <= t)
        .reduce((prev, curr) => (curr.start > prev.start ? curr : prev), { start: -Infinity });
    const status = JSON.parse(JSON.stringify(previousControl.status)); 
    const led_status = JSON.parse(JSON.stringify(previousControl.led_status)); 

    status[index][LEDindex] = ["", 150];
    led_status[index][LEDindex] = Array(partLength).fill(defaultColorData);

    for (let i = (t - startTime) * partLength / period; i < (t - startTime) * partLength / period + LEDlength; i++) {
        led_status[index][LEDindex][Math.round(i) % partLength] = secondaryColorData;
    }
    
    const controlData = {
        start: t,
        fade: false,
        status,
        led_status,
    };

    const maxKey = Math.max(...Object.keys(data.control).map(Number));
    const nextKey = maxKey + 1;
    data.control[nextKey.toString()] = controlData;
}

for (let t = startTime; t < endTime; t += (period / partLength * LEDlength)) {
    addFrame(Math.round(t));
}

fs.writeFileSync(path.join(__dirname, "jsons/exportDataEmptyNew.json"), JSON.stringify(data, null, 2));

console.log("Updated data has been saved to jsons/exportDataEmptyNew.json");