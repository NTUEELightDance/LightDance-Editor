const fs = require('fs');
const path = require('path');

const addFrame = (start) => {
    const previousControl = Object.values(data.control)
        .filter(d => d.start <= start)
        .reduce((prev, curr) => (curr.start > prev.start ? curr : prev), { start: -Infinity });
    const status = JSON.parse(JSON.stringify(previousControl.status)); 
    const led_status = JSON.parse(JSON.stringify(previousControl.led_status)); 

    // TODO: Add status, led_status
    
    const controlData = {
        start,
        fade: true, // TODO
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

    // TODO: Add status, led_status
    
    const controlData = {
        ...frame,
        fade: true, // TODO
        status,
        led_status,
    };

    data.control[key] = controlData;
}

// TODO: create specific props

let period = 500;
let LEDlength = 15;
// left: 1. right: -1
let direction = "mid";
let double = false;
let partLength = 266;

let index = data.dancer.findIndex(d => d.name === PropName);
let LEDindex = data.dancer[index].parts.findIndex(d => d.name === LEDPart);

let startTime = 390007;
let endTime =  391207;

let defaultColorData = [];
let secondaryColorData = [];


// fs.writeFileSync(path.join(__dirname, "./../../LightTableBackup/2025.03.17.json"), JSON.stringify(data, null, 0));
fs.writeFileSync(path.join(__dirname, "./props.json"), JSON.stringify(data, null, 0));
console.log(Object.keys(data.control).length)
console.log("Updated data has been saved to ./props.json");