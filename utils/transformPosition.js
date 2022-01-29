/**
 * Usage: node transformControl.js <path_to_postion.json> <output_posRecord.json> <output_posMap.json>
 */

const fs = require("fs");
const { exit } = require("process");
const { nanoid } = require("nanoid");

const args = process.argv;

if (args.length < 5) {
	console.error(`[Error] Invalid number of arguments!`);
	exit();
}

const inputPath = args[2];
const posRecordPath = args[3];
const posMapPath = args[4];

// Read File
console.log(`Reading json from ${inputPath}`);
let raw = null;
try {
	raw = fs.readFileSync(inputPath);
} catch (err) {
	console.error(err);
	exit();
}

const oldPosRecord = JSON.parse(raw);

const posRecord = [];
const posMap = {};

for (const control of oldPosRecord) {
	const id = nanoid(6);
	posRecord.push(id);
	posMap[id] = control;
}

// Write File
fs.writeFile(posRecordPath, JSON.stringify(posRecord), () => {
	console.log(`Writing posRecord to ${posRecordPath}`);
});

fs.writeFile(posMapPath, JSON.stringify(posMap), () => {
	console.log(`Writing posMap to ${posMapPath}`);
});
console.log(JSON.stringify(posRecord));
console.log(JSON.stringify(posMap));
