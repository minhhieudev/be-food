import { Router } from "express";
import VideoService from "../../services/video.service.js";
const VideoRoutes = Router();

VideoRoutes.get(
  "/download-audio",
new VideoService().downloadAudio
);

VideoRoutes.get(
  "/content",
  new VideoService().getContentVideo
);

VideoRoutes.get(
  "/summary-content",
  new VideoService().getSummaryContentVideo
);

export default VideoRoutes;
