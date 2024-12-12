import { Router } from "express";
import ImageService from "../../services/image.service.js";
const ImageRoutes = Router();

ImageRoutes.get("/services/:name", new ImageService().getService);

export default ImageRoutes;
