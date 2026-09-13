import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Multer destination:", uploadDir);
    console.log("Folder exists:", fs.existsSync(uploadDir));
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log("Multer filename:", filename);
    cb(null, filename);
  },
});

export const upload = multer({ storage });
