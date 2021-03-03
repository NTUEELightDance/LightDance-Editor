const express = require("express");
const asyncHandler = require("express-async-handler");

const db = require("../db");

const router = express.Router();

// Handle login post
router.route("/").post(
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await db.findUser(username);
    if (!user) {
      res.status(404).send("user not found");
    } else if (password !== user.password) {
      res.status(401).send("wrong password");
    } else {
      res.status(201).send({ username });
    }
    console.log(user);
    console.log(password);
  })
);

module.exports = router;
