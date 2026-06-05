import mammoth from "mammoth";
import Document from "../models/Document.js";
import path from "path";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();
    
    // File validation check
    const allowedExtensions = [".txt", ".md", ".docx"];
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({
        message: "Unsupported file type. Only .txt, .md, and .docx files are allowed.",
      });
    }

    let content = "";

    if (ext === ".txt" || ext === ".md") {
      const text = file.buffer.toString("utf-8");
      // Basic translation of text content into paragraph tags
      content = text
        .split(/\r?\n/)
        .map((line) => {
          const sanitized = line
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return `<p>${sanitized || "<br>"}</p>`;
        })
        .join("");
    } else if (ext === ".docx") {
      const result = await mammoth.convertToHtml({ buffer: file.buffer });
      content = result.value;
    }

    const title = path.basename(file.originalname, ext);

    const document = await Document.create({
      title: title || "Untitled Uploaded Document",
      content: content,
      owner: req.user._id,
      sharedWith: [],
    });

    return res.status(201).json(document);
  } catch (error) {
    return res.status(500).json({ message: "Upload processing failed", error: error.message });
  }
};
