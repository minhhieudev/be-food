import path from "path";
import multer from "multer";
import fs from "fs";

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "src/uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 90) + 10}`;
    const ext = path.extname(file.originalname);
    const newFileName = uniqueSuffix + ext;
    cb(null, newFileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(
        new Error(
          `Chỉ chấp nhận các tệp có đuôi là ${allowedExtensions.join(", ")}`
        )
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1 * 1024 * 1024,
    files: 1,
  },
}).single("file");

function uploadImagesMiddleware(req, res, next) {
  upload(req, res, function (err) {
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "Tệp tin vượt quá kích thước cho phép (1MB)" });
    }

    if (err) {
      console.log("error: ", err);
      return res
        .status(400)
        .json({ message: `Thất bại khi thêm hình ảnh. ${err?.message}` });
    }
    next();
  });
}

export default uploadImagesMiddleware;
