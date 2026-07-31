const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// Only allow PDF, JPG, PNG, max 5MB
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// UPLOAD a document for a customer
router.post(
  "/customers/:customerId/documents",
  requireRole(["admin", "agent", "customer"]),
  upload.single("file"),
  async (req, res) => {
    try {
      const customerId = Number(req.params.customerId);

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        fs.unlinkSync(req.file.path); // clean up orphaned file
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const document = await prisma.document.create({
        data: {
          customerId,
          fileName: req.file.originalname,
          filePath: req.file.filename, // store only the filename, not full path
        },
      });

      res.status(201).json({ success: true, document });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message || "Server error" });
    }
  }
);

// LIST documents for a customer
router.get("/customers/:customerId/documents", requireRole(["admin", "agent", "customer"]), async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { customerId: Number(req.params.customerId) },
      orderBy: { uploadedAt: "desc" },
    });

    res.json({ success: true, documents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DOWNLOAD a document
router.get("/documents/:id/download", requireRole(["admin", "agent", "customer"]), async (req, res) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: Number(req.params.id) } });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const filePath = path.join(uploadDir, document.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    res.download(filePath, document.fileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE a document
router.delete("/documents/:id", requireRole(["admin", "agent"]), async (req, res) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: Number(req.params.id) } });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const filePath = path.join(uploadDir, document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.document.delete({ where: { id: Number(req.params.id) } });

    res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;