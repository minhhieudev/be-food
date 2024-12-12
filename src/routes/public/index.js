import { Router } from "express";
import PublicAuthMiddleware from "../middlewares/public-auth.middleware.js";
import PartnerRoutes from "./partner.public-route.js";
import PerfectMoneyRoutes from "./perfect-money.public-route.js";
const PublicRoutes = Router();

const detailRoutes = [
  {
    path: "/",
    route: PartnerRoutes,
  },
];

const notAuthRoutes = [
  {
    path: "/perfect-money",
    route: PerfectMoneyRoutes,
  },
];

const registerPublicRoutes = (app) => {
  notAuthRoutes.forEach((route) => {
    PublicRoutes.use(route.path, route.route);
  });

  detailRoutes.forEach((route) => {
    PublicRoutes.use(route.path, PublicAuthMiddleware, route.route);
  });

  app.use("/public-api", PublicRoutes);
};

export default registerPublicRoutes;
