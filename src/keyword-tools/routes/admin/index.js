import { Router } from "express";
import KeywordTopicRoutes from "./keyword-topic.admin-route.js";
import AdminAuthMiddleware from "../../../routes/middlewares/admin-auth.middleware.js";
import KeywordRoutes from "./keyword.admin-route.js";
import YoutubeApiKeyRoutes from "./youtube-api-key.admin-route.js";
const AdminRoutes = Router();

const detailRoutes = [
  {
    path: "/topic",
    route: KeywordTopicRoutes,
  },
  {
    path: "/",
    route: KeywordRoutes,
  },
  {
    path: "/youtube-api-key",
    route: YoutubeApiKeyRoutes,
  },
];

const notAuthRoutes = [
  
]

const registerAdminKeywordToolRoutes = (app) => {
  notAuthRoutes.forEach((route) => {
    AdminRoutes.use(route.path, route.route);
  });

  detailRoutes.forEach((route) => {
    AdminRoutes.use(route.path, AdminAuthMiddleware, route.route);
  });

  app.use("/admin-api/kwt", AdminRoutes);
}

export default registerAdminKeywordToolRoutes;
