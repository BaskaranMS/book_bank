const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Define storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, "../public/uploads"); // Default to uploads
    if (file.mimetype.startsWith("image/")) {
      uploadPath = path.join(__dirname, "../public/images");
    } else if (file.mimetype === "application/pdf") {
      uploadPath = path.join(__dirname, "../public/pdfs");
    }

    ensureDirectoryExists(uploadPath); // Create folder if it doesn't exist
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, fileName);
  },
});

// File filter for images/PDFs
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed"), false);
  }
};

// Upload middleware
const upload = multer({ storage, fileFilter });

module.exports = upload; // Export using CommonJS
