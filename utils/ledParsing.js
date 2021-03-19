/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { LEDPARTS } = require("../data/texture.json");

// console.log(LEDPARTS);

// LED_HANDLE, LED_GUARD, LED_SWORD 是 劍的，所以不用
// LED_L_SHOULDER, LED_R_SHOULDER
function parse_shoulder(pic) {
  // TODO
  return pic;
}

// LED_NECKTIE
function parse_necktie(pic, w, h) {
  // TODO
  return pic;
}

// LED_BELT
function parse_belt(pic, w, h) {
  // TODO
  return pic;
}

// LED_R_SHOE, LED_L_SHOE
function parse_shoe(pic, w, h) {
  return pic;
}

const fs = require("fs");
const { PNG } = require("pngjs");

const led = {};

async function main() {
  for (const [key, { prefix, postfix, name }] of Object.entries(LEDPARTS)) {
    led[key] = {};
    for (const n of name) {
      const re = await new Promise((resolve, _) => {
        const path = `.${prefix}${n}${postfix}`;
        console.log(`Parsing ${path}`);
        fs.createReadStream(path)
          .pipe(new PNG())
          .on("parsed", function () {
            const pixel = [];
            this.data.forEach((_, idx) => {
              if (idx % 4 === 0) {
                const r = this.data[idx];
                const g = this.data[idx + 1];
                const b = this.data[idx + 2];
                // eslint-disable-next-line no-bitwise
                pixel.push(`0x${((r << 16) + (g << 8) + b).toString(16)}`);
              }
            });
            switch (key) {
              case "LED_L_SHOULDER":
                resolve(parse_shoulder(pixel, this.width, this.height));
                break;
              case "LED_R_SHOULDER":
                resolve(parse_shoulder(pixel, this.width, this.height));
                break;
              case "LED_NECKTIE":
                resolve(parse_necktie(pixel, this.width, this.height));
                break;

              case "LED_BELT":
                resolve(parse_belt(pixel, this.width, this.height));
                break;

              case "LED_R_SHOE":
                resolve(parse_shoe(pixel, this.width, this.height));
                break;
              case "LED_L_SHOE":
                resolve(parse_shoe(pixel, this.width, this.height));
                break;
              default:
                break;
            }
          });
      });
      led[key][n] = re;
    }
    console.log(led);
    // Write File
    const outputPath = "./data/led.json";
    fs.writeFile(outputPath, JSON.stringify(led), () => {
      console.log(`Writing new file to ... ${outputPath}`);
    });
  }
}
main();
