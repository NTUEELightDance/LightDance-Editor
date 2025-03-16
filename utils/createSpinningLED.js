const fs = require('fs');
const path = require('path');

const data = require("./jsons/exportDataEmpty.json");

const startTime = 2000;
const endTime = 16000;
const period = 1000;
const LEDlength = 6;
const PropName = "11_small_orb_1";
const LEDPart = "main_LED";
const defaultColorData = ["blue", 255];
const secondaryColorData = ["red", 255];
const direction = 1;
const double = true;

const partLength = data.dancer.find(d => d.name === PropName).parts.find(d => d.name === LEDPart).length;
const index = data.dancer.findIndex(d => d.name === PropName);
const LEDindex = data.dancer[index].parts.findIndex(d => d.name === LEDPart);

const addFrame = (start) => {
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

for (let t = startTime; t < endTime; t += (period / partLength * LEDlength)) {
    addFrame(Math.round(t));
}

fs.writeFileSync(path.join(__dirname, "jsons/exportDataEmptyNew.json"), JSON.stringify(data, null, 2));

console.log("Updated data has been saved to jsons/exportDataEmptyNew.json");