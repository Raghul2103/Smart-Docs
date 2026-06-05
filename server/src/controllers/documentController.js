import Document from "../models/Document.js";
import User from "../models/User.js";

export const createDocument = async (req, res) => {
  try {
    const document = await Document.create({
      title: "Untitled Document",
      content: "",
      owner: req.user._id,
      sharedWith: [],
    });

    return res.status(201).json(document);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { search, myPage = 1, sharedPage = 1, limit = 6 } = req.query;

    const myLimit = parseInt(limit);
    const mySkip = (parseInt(myPage) - 1) * myLimit;

    const sharedLimit = parseInt(limit);
    const sharedSkip = (parseInt(sharedPage) - 1) * sharedLimit;

    let query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const myTotalDocs = await Document.countDocuments({
      ...query,
      owner: req.user._id,
    });

    const sharedTotalDocs = await Document.countDocuments({
      ...query,
      sharedWith: req.user._id,
    });

    const myDocs = await Document.find({
      ...query,
      owner: req.user._id,
    })
      .populate("owner", "name email")
      .populate("sharedWith", "name email")
      .sort({ updatedAt: -1 })
      .skip(mySkip)
      .limit(myLimit);

    const sharedDocs = await Document.find({
      ...query,
      sharedWith: req.user._id,
    })
      .populate("owner", "name email")
      .populate("sharedWith", "name email")
      .sort({ updatedAt: -1 })
      .skip(sharedSkip)
      .limit(sharedLimit);

    return res.json({
      myDocuments: myDocs,
      sharedDocuments: sharedDocs,
      myTotalPages: Math.ceil(myTotalDocs / myLimit),
      sharedTotalPages: Math.ceil(sharedTotalDocs / sharedLimit),
      myTotalDocs,
      sharedTotalDocs,
      currentPageMy: parseInt(myPage),
      currentPageShared: parseInt(sharedPage),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate("owner", "name email")
      .populate("sharedWith", "name email");

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const isOwner = doc.owner._id.toString() === req.user._id.toString();
    const isShared = doc.sharedWith.some(
      (user) => user._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(doc);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const isOwner = doc.owner.toString() === req.user._id.toString();
    const isShared = doc.sharedWith.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.body.title !== undefined && req.body.title !== doc.title) {
      if (!isOwner) {
        return res.status(403).json({ message: "Only the owner can rename the document" });
      }
      doc.title = req.body.title;
    }

    if (req.body.content !== undefined) {
      doc.content = req.body.content;
    }

    await doc.save();
    
    const updatedDoc = await Document.findById(doc._id)
      .populate("owner", "name email")
      .populate("sharedWith", "name email");

    return res.json(updatedDoc);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can delete the document" });
    }

    await Document.deleteOne({ _id: doc._id });

    return res.json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const shareDocument = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can share the document" });
    }

    const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!targetUser) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot share the document with yourself" });
    }

    const alreadyShared = doc.sharedWith.some(
      (userId) => userId.toString() === targetUser._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ message: "Document already shared with this user" });
    }

    doc.sharedWith.push(targetUser._id);
    await doc.save();

    const updatedDoc = await Document.findById(doc._id)
      .populate("owner", "name email")
      .populate("sharedWith", "name email");

    return res.json({
      message: "Document shared successfully",
      document: updatedDoc,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
