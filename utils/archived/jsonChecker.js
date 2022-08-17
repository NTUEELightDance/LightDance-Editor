/**
 * Usage: node jsonChecker.js <path_to.json> <mode>
 */

const fs = require("fs");
// File IO

const { exit } = require("process");
// Exit when error occurs

const Ajv = require("ajv");
// JSON validator

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
// Read Arguments

const schemas = require("./schemas");
console.log(schemas);

const argv = yargs(hideBin(process.argv)).argv;

let json;
let configJson;
let raw;
let data = {};

if (argv.config) {
  configJson = argv.config;
} else {
  console.error(`[Error] Missing config file`);
  exit();
}

if (argv.LED) {
  json = argv.LED;
  console.log("Reading json from ... ", json);

  try {
    raw = fs.readFileSync(json);
  } catch (err) {
    console.error(`[Error] Can't open file ${json}`);
    exit();
  }
  data["LED"] = JSON.parse(raw);
}
if (argv.Fiber) {
  json = argv.Fiber;

  console.log("Reading json from ... ", json);
  try {
    raw = fs.readFileSync(json);
  } catch (err) {
    console.error(`[Error] Can't open file ${json}`);
    exit();
  }
  data["Fiber"] = JSON.parse(raw);
}

console.log("Reading config json from ... ", configJson);
let configRaw = null;
try {
  configRaw = fs.readFileSync(configJson);
} catch (err) {
  console.error(`[Error] Can't open config file ${configJson}`);
  exit();
}
const config = JSON.parse(configRaw);

console.log(`Start validating  ${json}`);
const ajv = new Ajv();
const { configSchema, LEDIdSchema, FiberIdSchema } = schemas;
const configValidate = ajv.compile(configSchema);

// Start validating config.json
const configValid = configValidate(config);
console.log(configValid);

if (configValid) {
  const { OFPARTS, LEDPARTS } = config;

  // Validate if Fiber id is unique
  const FiberIds = Object.values(OFPARTS);
  const FiberIdsValidate = ajv.compile(FiberIdSchema);
  const configFiberValid = FiberIdsValidate(FiberIds);
  if (!configFiberValid) {
    console.error(`[Error]: Fiber duplicate chanel found`);
    exit();
  }

  // Validate if LED id is unique
  const LEDIds = Object.values(LEDPARTS).map((e) => e.id);
  const LEDIdsValidate = ajv.compile(LEDIdSchema);
  const configLEDValid = LEDIdsValidate(LEDIds);

  if (!configLEDValid) {
    console.error(`[Error]: LED duplicate chanel found `);
    exit();
  }
} else {
  console.error(`[Error]: Wrong config format`);
  exit();
}
console.log(`Check Passed: ${configJson}`);

if (argv.LED) {
  const { LEDSchema } = schemas;
  const LEDValidate = ajv.compile(LEDSchema);
  const LEDValid = LEDValidate(data.LED);

  if (!LEDValid) {
    console.error(`[Error]: Wrong LED format`);
  } else {
    console.log(`Check Passed: ${argv.LED}`);
  }
}

if (argv.Fiber) {
  const { FiberSchema } = schemas;
  const FiberValidate = ajv.compile(FiberSchema);
  const FiberValid = FiberValidate(data.Fiber);

  if (!FiberValid) {
    console.error(`[Error]: Wrong LED format`);
  } else {
    console.log(`Check Passed: ${argv.Fiber}`);
  }
}
