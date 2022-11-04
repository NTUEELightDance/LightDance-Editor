/**
 * Usage: node generateLedBlack.js <partName> <len> <effectName> <color>
 * Ex. node generateLedBlack.js Shoe_R_LED 74 red '#ff0000'
 * colorcode needs ' ' cause it starts with #
 */

const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: generateLedBlack.js
if (args.length < 6) {
  console.error(`Usage: node generateLedBlack.js <partName> <len> <effectName> <color>`);
  exit();
}
const partName = args[2];
const len = parseInt(args[3], 10);
const effectName = args[4];
const colorCode = args[5];

const repeat = 0;
const effects = [];

const blackEffect = {
  start: 0,
  fade: false,
  effect: [],
};

for (let i = 0; i < len; ++i) {
  blackEffect.effect.push({
    colorCode,
    alpha: 10,
  });
}

effects.push(blackEffect);

const input = {
  partName,
  effectName,
  repeat,
  effects,
};

console.log(JSON.stringify({ input: input }));
