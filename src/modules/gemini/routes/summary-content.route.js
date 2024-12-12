import { Router } from "express";
import FrontendAuthMiddleware from "../../../routes/middlewares/frontend-auth.middleware.js";
import SummaryContentService from "../services/summary-content.service.js";
const summaryContentService = new SummaryContentService();
const SummaryContentRoutes = Router();

// SummaryContentRoutes.get(
//   "/youtube/:videoID",
// //   FrontendAuthMiddleware,
//   summaryContentService.getSummaryYoutube
// );

export default SummaryContentRoutes;
