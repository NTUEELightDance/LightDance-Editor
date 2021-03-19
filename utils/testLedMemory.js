const { LocalConvenienceStoreOutlined } = require("@material-ui/icons");
const fs = require("fs");

const time_interval = 500;

function genStatus() {
  const handleOptions = ["bl_handle", "red_handle", "blue_handle"];
  const guardOptions = ["bl_handle", "red_guard", "blue_guard"];
  const swordOptions = ["bl_handle", "red_sword", "blue_sword"];
  return {
    LED_HANDLE: {
      src: handleOptions[Math.floor(Math.random() * handleOptions.length)],
      alpha: 1,
    },
    LED_GUARD: {
      src: guardOptions[Math.floor(Math.random() * guardOptions.length)],
      alpha: 1,
    },
    LED_SWORD: {
      src: swordOptions[Math.floor(Math.random() * swordOptions.length)],
      alpha: 1,
    },
  };
}

let start = 0;
const test_control = [];
for (let i = 0; i < 800; ++i) {
  test_control.push({
    start,
    status: genStatus(),
    fade: false,
  });
  start += time_interval;
}
console.log(test_control);

// Write File
const outputPath = "./test_control.json";
fs.writeFile(outputPath, JSON.stringify(test_control), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
