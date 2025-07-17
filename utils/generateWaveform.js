const path = require("path");

const child_process = require("child_process");
const readline = require("readline");


const waveformFolder = "../files/data/";
const musicFolder = "../files/music/";    // you can alter the music name here


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const readIntegerInput = (prompt, defaultValue, retry) => {
  return new Promise((resolve, reject) => {
    rl.question(prompt, (input) => {
      const parsedInput = parseInt(input, 10);

      if (!isNaN(parsedInput)) {
        resolve(parsedInput);
        return;
      }

      if (input === "") {
        resolve(defaultValue);
        return;
      }

      if (retry) {
        console.log("Invalid input, try again...");
        resolve(readIntegerInput(prompt, defaultValue, retry));
        return;
      }

      reject(new Error("Invalid input"));
    });
  });
};

const readInput = async (prompt, defaultValue) => {
  return new Promise((resolve) => {
    rl.question(prompt, (input) => {
      if (input === "") {
        resolve(defaultValue);
        return;
      }

      resolve(input);
    });
  });
};

const main = async () => {
  const pixelsPerSecond = await readIntegerInput("Enter pixels-per-second (1000): ", 1000, true);
  const audioFileName = await readInput("Enter audio filename (2025EECamp.mp3): ", "2025EECamp.mp3");
  const waveformFileName = await readInput("Enter waveform filename (waveform.json): ", "waveform.json");

  const audioFilePath = path.join(musicFolder, audioFileName);
  const waveformFilePath = path.join(waveformFolder, waveformFileName);

  const cmd = ["audiowaveform", "-i", String(audioFilePath), "-o", String(waveformFilePath), "--pixels-per-second", String(pixelsPerSecond)];

  let cmdString = cmd.join(" ");
  console.log(`cmd = ${cmdString}`);

  let startGenerationTime = Date.now();
  console.log("start generating");

  try {
    child_process.execSync(cmdString);
  } catch (err) {
    console.error("--- problem generating sound wave image");
    console.error(err);
  }
  const elapsedTime = Date.now() - startGenerationTime;
  console.log(`Time taken for generating waveform: ${elapsedTime} ms`);
};

main().then(() => {
  rl.close();
}).catch((err) => {
  console.error(err);
  rl.close();
});
