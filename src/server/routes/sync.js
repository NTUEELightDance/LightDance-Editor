const express = require("express");

const router = express.Router();

// Handle login post
router.route("/").post(express.urlencoded({ extended: false }), (req, res) => {
  const { type, mode, data } = req.body;
  console.log(type, mode, data);
  res.send("sync");
});

module.exports = router;
