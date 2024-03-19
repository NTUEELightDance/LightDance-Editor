const path = require("path");

const child_process = require("child_process");

const editorFolder = process.argv[2];
const filesFolder = process.argv[3];


const main = async () => {
  const packScriptPath= path.join(editorFolder, "pack/pack.py");
  const packCommand = ["python3", String(packScriptPath), "-r"];

  try {
    child_process.execSync(packCommand.join(" "));
  } catch (err) {
    // console.error(err);
    process.exit(1);
  }

  const releaseFolder = path.join(filesFolder, "data");
  const moveCommand = ["mv", "../editor-blender.zip", releaseFolder];

  try {
    child_process.execSync(moveCommand.join(" "));
  } catch (err) {
    // console.error(err);
    process.exit(1);
  }
};

main();
