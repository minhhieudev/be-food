import SummaryContentRoutes from "./summary-content.route.js";
import { Router } from "express";
const GeminiRoutes = Router();

const detailRoutes = [
  // {
  //   path: "/summary-content",
  //   route: SummaryContentRoutes,
  // },
];

detailRoutes.forEach((route) => {
  GeminiRoutes.use(route.path, route.route);
});

export default GeminiRoutes;
