import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaDir = path.resolve(__dirname, "../meta/media");

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.user_id || "guest";
    const reqType = file.fieldname;
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();

    const newFilename = `${userId}_${reqType}_${timestamp}${ext}`;
    cb(null, newFilename);
  },
});

export const upload = multer({ storage });
