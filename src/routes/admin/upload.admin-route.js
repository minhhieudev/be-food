import { Router } from "express";
import uploadImagesMiddleware from "../../middleware/upload-images.middleware.js";
import UploadService from "../../services/upload.service.js";

const UploadRoutes = Router();

UploadRoutes.post(
  "/image",
  uploadImagesMiddleware,
  new UploadService().uploadImage
);

export default UploadRoutes;
