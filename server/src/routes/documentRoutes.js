import express from "express";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  shareDocument,
} from "../controllers/documentController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createDocument)
  .get(getDocuments);

router.route("/:id")
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

router.post("/:id/share", shareDocument);

export default router;
