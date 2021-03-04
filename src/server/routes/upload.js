const express = require("express");
const asyncHandler = require("express-async-handler");
const fileUpload = require("express-fileupload");

const router = express.Router();

// default options
router.use(fileUpload());

// Handle upload post

router.post(
  "/images",
  asyncHandler(async (req, res) => {
    // Uploaded files
    console.log(req.files);
    // console.log(req.files.my_profile_pic.name);
    // console.log(req.files.my_pet.name);
    // console.log(req.files.my_cover_photo.name);
    res.send("get");
  })
);

module.exports = router;
