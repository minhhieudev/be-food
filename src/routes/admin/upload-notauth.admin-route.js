import { Router } from "express";
import UploadService from "../../services/upload.service.js";

const UploadNotAuthRoutes = Router();

UploadNotAuthRoutes.get("/image", new UploadService().getImage);

export default UploadNotAuthRoutes;
