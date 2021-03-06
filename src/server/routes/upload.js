const path = require("path");
const express = require("express");
const asyncHandler = require("express-async-handler");
const fileUpload = require("express-fileupload");

const router = express.Router();

// default options
router.use(fileUpload());

// Handle upload post

router.post(
  "/:fileType",
  asyncHandler(async (req, res) => {
    // Uploaded files
    const { filePath } = req.body;
    const appDir = path.dirname(require.main.filename);
    const uploadPath = path.resolve(appDir, `../../asset/LED/${filePath}`);
    const { files } = req;
    Object.values(files).forEach((file) => {
      file.mv(`${uploadPath}/${file.name}`);
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
