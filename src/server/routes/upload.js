const path = require("path");
const fs = require("fs");
const express = require("express");
const asyncHandler = require("express-async-handler");
const fileUpload = require("express-fileupload");
const expressAsyncHandler = require("express-async-handler");

const router = express.Router();

// default options
router.use(fileUpload());

// Handle upload post

router.post(
  "/images",
  asyncHandler(async (req, res) => {
    // Uploaded files
    const { filePath, imagePrefix } = req.body;
    const appDir = path.dirname(require.main.filename);
    const uploadPrefix = imagePrefix.slice(
      0,
      imagePrefix.slice(0, -1).lastIndexOf("/") + 1
    );

    const uploadPath = path.resolve(appDir, `../../${uploadPrefix + filePath}`);
    console.log(uploadPath);
    const texturePath = path.resolve(appDir, "../../data/texture.json");
    let modified = false;
    const { files } = req;

    Object.values(files).forEach((file) => {
      file.mv(`${uploadPath}/${file.name}`);
    });

    fs.readFile(texturePath, (readErr, data) => {
      if (readErr) {
        res.status(404).send(
          JSON.stringify({
            message: `read texture failed: ${readErr}`,
            uploaded: Object.values(files).map(
              (file) => `${filePath}/${file.name}`
            ),
          })
        );
        return;
      }
      const texture = JSON.parse(data);

      const existedImages = texture.LEDPARTS[filePath].name;
      console.log(existedImages);
      Object.values(files).forEach((file) => {
        const fileToCheck = file.name.split(".")[0];
        console.log(fileToCheck);
        if (!existedImages.includes(fileToCheck)) {
          texture.LEDPARTS[filePath].name.push(fileToCheck);
          modified = true;
        }
      });

      if (modified)
        fs.writeFile(texturePath, JSON.stringify(texture), (writeErr) => {
          if (writeErr)
            res.status(404).send(
              JSON.stringify({
                message: `write texture failed: ${writeErr}`,
                uploaded: Object.values(files).map(
                  (file) => `${filePath}/${file.name}`
                ),
              })
            );
        });
    });

    res.send(
      JSON.stringify({
        message: "successfully",
        uploaded: Object.values(files).map(
          (file) => `${filePath}/${file.name}`
        ),
      })
    );
  })
);

module.exports = router;
