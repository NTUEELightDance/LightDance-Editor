const express = require("express");

const router = express.Router();

// Handle login post
router.route("/").post(express.urlencoded({ extended: false }), (req, res) => {
  const { password } = req.body;
  console.log(password);
  res.send("login");
});

module.exports = router;
