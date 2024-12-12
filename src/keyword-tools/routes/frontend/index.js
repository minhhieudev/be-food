import { Router } from "express";
import FrontendAuthMiddleware from "../../../routes/middlewares/frontend-auth.middleware.js";
import KeywordTopicRoutes from "./keyword-topic.frontend-route.js";
import CustomerRoutes from "./customer.frontend-route.js";
import KeywordRoutes from "./keyword.frontend-route.js";
import VideoRoutes from "./video.frontend-route.js";
const FrontendRoutes = Router();

const detailRoutes = [
  {
    path: "/topic",
    route: KeywordTopicRoutes,
  },
  {
    path: "/customers",
    route: CustomerRoutes,
  },
  {
    path: "/",
    route: KeywordRoutes,
  },
  {
    path: "/video",
    route: VideoRoutes,
  },
];

const notAuthRoutes = [
  
]

const registerFrontendKeywordToolRoutes = (app) => {
  notAuthRoutes.forEach((route) => {
    FrontendRoutes.use(route.path, route.route);
  });

  detailRoutes.forEach((route) => {
    FrontendRoutes.use(route.path, FrontendAuthMiddleware, route.route);
  });

  app.use("/frontend-api/kwt", FrontendRoutes);
}

export default registerFrontendKeywordToolRoutes;
