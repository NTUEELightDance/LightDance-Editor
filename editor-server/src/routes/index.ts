import express from "express";

import exportData from "./api/exportData";
import uploadData from "./api/uploadData";
import exportLogger from "./api/exportLogger";
import getLogger from "./api/getLogger";

const router = express.Router();

router.get("/exportData", exportData);
router.post("/uploadData", uploadData);
router.get("/exportLogger.csv", exportLogger);
router.get("/logger", getLogger);

export default router;
