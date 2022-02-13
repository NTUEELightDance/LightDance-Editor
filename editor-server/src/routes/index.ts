import express from "express";

import exportData from "./api/exportData";
import uploadData from "./api/uploadData";

const router = express.Router();

router.get("/exportData.json", exportData);
router.post("/uploadData", uploadData);

export default router;
