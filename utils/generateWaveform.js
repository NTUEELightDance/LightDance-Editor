const fs = require("fs");
const process = require("process");
const path = require("path");
const axios = require("axios");

const child_process = require("child_process");

const sharp = require('sharp');
const jm = require('join-images');
const readline = require('readline');

// the annotation part can be used when the file is a module

// import { createWriteStream, existsSync, unlink } from "fs";
// import { platform } from "process";
// import { join, dirname, basename } from "path";
// import path from 'path';
// import axios from "axios";
// import { fileURLToPath } from 'url';
// import { execSync } from 'child_process';
// const url = require("url");

// const __filename = url.fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const __dirname = path.dirname(__filename);

// procedure: check existance->download->construct command->generate waveform

// const img_res = '4000x1000';
let img_res_width = 40000;
let img_res_height = 400;
const img_res = String(img_res_width) + 'x' + String(img_res_height);
// console.log(`img_res = ${img_res}`);
const hex_colo = '3D82B1';
const sname = '../files/music/waveform.png';
const sname_tmp = '../files/music/waveform_tmp.png';
const musicName = '../files/music/2023.mp3';    // you can alter the music name here
let ifp = path.join(String(__dirname), sname);       // name (path included) to the waveform image
let ifp_temp = path.join(String(__dirname), sname_tmp);       // name (path included) to the waveform image
let sfp = path.join(String(__dirname), musicName);   // name (path included) to the music
const leftName = '../files/music/leftWaveform.png';
const rightName = '../files/music/rightWaveform.png';
const lcp = path.join(String(__dirname), leftName);
const rcp = path.join(String(__dirname), rightName);
let releaseUrl = '';    // url for downloading ffmpeg
let ffbin = '';   // the path name(file name included) of the ffmpeg binary
let cmd = [];   // the command that will later be used to generate waveform



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
        console.log("Invalid input, try again...");
        resolve(readIntegerInput(prompt));
        // reject(new Error('Invalid input. Please enter a valid integer.'));
      }
    });
  });
}

const readInput = async (width, height) => {

  try {
    width = await readIntegerInput('Enter the width of the waveform: ');
    height = await readIntegerInput('Enter the height of the waveform: ');

    console.log(`Waveform resolution: ${width}x${height}`);

  } catch (error) {
    console.log("something wrong in the input...")
    console.error(error.message);
  } finally {
    rl.close();
  }
}


const callFFMPEG = () => {
  cmd = ['sudo', 'ffmpeg'];
  cmd = [...cmd, '-i', String(sfp),
    '-hide_banner', '-loglevel', 'error', '-filter_complex',
  `showwavespic=s=${img_res}:split_channels=1:colors=${hex_colo}`,
    '-frames:v', '1', '-y', String(ifp_temp)]

  let cmdString = cmd.join(' ');
  // console.log(`cmd = ${cmd.join(' ')}`);
  let startGenerationTime = Date.now();
  console.log("start generating");
  try {
    const ret = child_process.execSync(cmdString);
  } catch (err) {
    console.error('--- problem generating sound wave image');
    console.error(err);
  }
  const elapsedTime = Date.now() - startGenerationTime;
  console.log(`Time taken for generating waveform: ${elapsedTime} ms`);
}

// download from url and save as dest, then generate waveform
const dl_url = async (url, dest) => {
  await readInput(img_res_width, img_res_height)
  let start_time = Date.now();
  console.log("downloading ffmpeg...");
  await axios({
    method: 'get',
    url: url,
    responseType: 'stream',
    // httpsAgent: {
    //   rejectUnauthorized: false,  // Disable SSL verification
    // },
  }).then((response) => {
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    // console.log("here1");
    return new Promise((resolve, reject) => {
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      // or writer.on('finish')?
      writer.on('close', () => {
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });

    });

  }).then(() => {
    const downloadTime = (Date.now() - start_time) / 1000;  // Convert milliseconds to seconds
    console.log(`Download time ${downloadTime.toFixed(2)}s`);
    callFFMPEG();
  }).catch(function (error) {
    console.error('Error downloading file:', error.message);
  });
}

// unzip file (not used in this file but it exists in the original blender addon)
const unzip = (zipPath, extractDirPath) => {
  const zip = new AdmZip(zipPath);

  try {
    zip.extractAllTo(extractDirPath, /*overwrite*/ true);
    console.log(`Successfully extracted: ${zipPath} to ${extractDirPath}`);
  } catch (error) {
    console.error('Error extracting zip file:', error.message);
  }
}

// check if ffmpeg exists
const ffmpegExist = () => {
  // decide releaseUrl based on operating system
  if (process.platform.startsWith('win')) {
    releaseUrl = 'https://github.com/Pullusb/static_bin/raw/main/ffmpeg/windows/ffmpeg.exe';
  } else if (process.platform.startsWith('linux') || process.platform === 'freebsd') {
    releaseUrl = 'https://github.com/Pullusb/static_bin/raw/main/ffmpeg/linux/ffmpeg';
  } else { // Mac
    releaseUrl = 'https://github.com/Pullusb/static_bin/raw/main/ffmpeg/mac/ffmpeg';
  }

  // Check if ffmpeg is already in the current path
  ffbin = path.join(String(__dirname), String(path.basename(releaseUrl)));
  return fs.existsSync(ffbin);
}

const cutImages = async () => {
  await sharp(String(ifp_temp))
    .extract({ left: 0, top: 0, width: img_res_width, height: img_res_height / 4 })
    .toFile(String(lcp))
    .then(() => {
      // console.log("here2.5")
    })
    .catch((err) => {
      // console.log("here2.5");
      if (err) {
        console.log("Failed extracting upper half of the waveform...")
        console.log(err);
      }
    })
  // console.log("here3");
  await sharp(String(ifp_temp))
    .extract({ left: 0, top: 3 * img_res_height / 4, width: img_res_width, height: img_res_height / 4 })
    .toFile(String(rcp))
    .then(() => {
      // console.log("here3.5")
    })
    .catch((err) => {
      // console.log("here3.5");
      if (err) {
        console.log("Failed extracting lower half of the waveform...")
        console.log(err);
      }
    })
  // console.log("here4");
}

const AsyncJoinImages = async () => {
  console.log("joining waveforms...")
  await jm.joinImages([String(lcp), String(rcp)], { direction: "vertical" })
    .then((img) => {
      // Save image as file
      img.toFile(String(ifp))
      .then(()=>{console.log("image saved");})
      .catch((err)=>{
        console.log("failed to save image as file")
        console.log(err)
      });
      
    }).catch((err) => {
      console.log("Failed joining waveforms...")
      console.log(err);
    });
}

const AsyncImageManipulation = async () => {
  await cutImages();
  await AsyncJoinImages();
}

const errReport = (err) => {
  if(err) throw err;
}

const rmRedundantWaveform = () => {
  let rmCmd = ['rm', String(lcp), String(rcp), String(ifp_temp)];
  rmCmdString = rmCmd.join(' ');
  // console.log(`rmCmdString = ${rmCmdString}`);
  console.log("removing redundant waveforms...");
  try {
    fs.unlink(String(lcp), errReport);
    fs.unlink(String(rcp), errReport);
    fs.unlink(String(ifp_temp), errReport);
  } catch (error) {
    console.error('Error deleting existing file:', error.message);
  }
}

const mainGenerate = async (releaseUrl, ffbin) => {
  await dl_url(releaseUrl, String(ffbin));
  await AsyncImageManipulation();
  rmRedundantWaveform();
}


// download if ffmpeg not in path
let ffmpegExistance = ffmpegExist();  // ffbin, releaseUrl is set in ffmpegExist
// delete ffmpeg if exists
if (ffmpegExistance) {
  try {
    fs.unlink(ffbin, (err) => {
      if (err) throw err;
      console.log(`successfully deleted ${ffbin}`);
    });

  } catch (error) {
    console.error('Error deleting existing file:', error.message);
  }
}

mainGenerate(releaseUrl, ffbin);
