const path = require("path");

const child_process = require("child_process");
const readline = require("readline");


const sname = "../files/data/wavform.json";
const musicName = "../files/music/2023.mp3";    // you can alter the music name here
let ifp = path.join(String(__dirname), sname);       // name (path included) to the waveform image
let sfp = path.join(String(__dirname), musicName);   // name (path included) to the music
let cmd = [];   // the command that will later be used to generate waveform
let pixelsPerSecond = 1000;


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const readIntegerInput = (prompt) => {
  return new Promise((resolve, reject) => {
    rl.question(prompt, (input) => {

      const parsedInput = parseInt(input, 10);
      if (!isNaN(parsedInput)) {
        resolve(parsedInput);
      } else {
        if (input == "") {
          resolve(1000);
        } else {
          console.log("Invalid input, try again...");
          resolve(readIntegerInput(prompt));
        }
      }
    });
  });
};

const readInput = async () => {

  try {
    pixelsPerSecond = await readIntegerInput("Enter pixels-per-second(1000): ");
    if (!(typeof pixelsPerSecond === 'number' && isFinite(pixelsPerSecond))) {
      pixelsPerSecond = 1000;
    }
  } catch (error) {
    console.log("something wrong in the input...");
    console.error(error.message);
  } finally {
    rl.close();
  }
};

const generateWav = () => {

  cmd = ["sudo", "audiowaveform"];
  cmd = [...cmd, "-i", String(sfp), "-o", String(ifp), "--pixels-per-second", String(pixelsPerSecond)];

  let cmdString = cmd.join(" ");
  console.log(`cmd = ${cmdString}`);
  let startGenerationTime = Date.now();
  console.log("start generating");
  try {
    const ret = child_process.execSync(cmdString);
  } catch (err) {
    console.error("--- problem generating sound wave image");
    console.error(err);
  }
  const elapsedTime = Date.now() - startGenerationTime;
  console.log(`Time taken for generating waveform: ${elapsedTime} ms`);
};

const mainGenerate = async () => {
  await readInput();
  generateWav();
}

mainGenerate();