const express = require("express");
const asyncHandler = require("express-async-handler");

const db = require("../db");

const router = express.Router();

db.initialize();

// Handle login post
router
  .route("/")
  .get(
    asyncHandler(async (req, res) => {
      res.send(await db.findAllBranches());
    })
  )
  .post(
    express.urlencoded({ extended: false }),
    asyncHandler(async (req, res) => {
      const { name } = req.body;

      if (!(await db.findBranch(name))) {
        await db.createBranch(name);
        res.send(`branch: ${name} created`);
      } else {
        res.send(`branch: ${name} exists`);
      }
    })
  )
  .delete(
    express.urlencoded({ extended: false }),
    asyncHandler(async (req, res) => {
      const { name } = req.body;

      if (name === "All") {
        await db.deleteAllBranches();
        res.send("deleteAllBranches");
      } else if (!(await db.findBranch(name))) {
        res.send("Branch Not Found");
      } else {
        await db.deleteBranch(name);
        res.send(`delete branch: ${name}`);
      }
    })
  );

module.exports = router;
