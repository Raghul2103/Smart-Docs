import express from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploadController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post("/", protect, upload.single("file"), uploadFile);

export default router;
