import { Router } from "express";
import multer from "multer";
import YoutubeApiKeyService from "../../services/youtube-api-key.service.js";
const storage = multer.memoryStorage();
const upload = multer({ storage });

const YoutubeApiKeyRoutes = Router();

YoutubeApiKeyRoutes.post("/youtube-api-key/", upload.single('file'),new YoutubeApiKeyService().createApiKeys);

export default YoutubeApiKeyRoutes;
