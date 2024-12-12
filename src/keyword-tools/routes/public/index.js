import { Router } from "express";
import FrontendAuthMiddleware from "../../../routes/middlewares/frontend-auth.middleware.js";
const KeywordPublicRoutes = Router();

const detailRoutes = [];

const notAuthRoutes = [];

const registerPublicKeywordToolRoutes = (app) => {
  notAuthRoutes.forEach((route) => {
    KeywordPublicRoutes.use(route.path, route.route);
  });

  detailRoutes.forEach((route) => {
    KeywordPublicRoutes.use(route.path, FrontendAuthMiddleware, route.route);
  });

  app.use("/public-api/kwt", KeywordPublicRoutes);
};

export default registerPublicKeywordToolRoutes;
