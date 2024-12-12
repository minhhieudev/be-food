import { Router } from "express";
import AdminAuthRoutes from "./auth.admin-route.js";
import CustomerRoutes from "./customer.admin-route.js";
import DashboardRoutes from "./dashboard.admin-route.js";
import NotificationRoutes from "./notification.admin-route.js";
import OrderRoutes from "./order.admin-route.js";
import PaymentActivityRoutes from "./payment-activity.admin-route.js";
import PartnerRoutes from "./partner.admin-route.js";
import PaymentRoutes from "./payment.admin-route.js";
import ServiceGroupRoutes from "./service-group.admin-route.js";
import ServicePackageRoutes from "./service-package.admin-route.js";
import ServiceTagRoutes from "./service-tag.admin-route.js";
import SettingRoutes from "./setting.admin-route.js";
import UploadRoutes from "./upload.admin-route.js";
import AdminAuthMiddleware from "../middlewares/admin-auth.middleware.js";
import AdminAuthNotAuthRoutes from "./auth-notauth.admin-route.js";
import SettingNotAuthRoutes from "./setting-notauth.admin-route.js";
import ImageRoutes from "./image.admin-route.js";
import UploadNotAuthRoutes from "./upload-notauth.admin-route.js";

import IngredientRoutes from "./ingredient.admin-route.js";
import MealsRoutes from "./meal.admin-route.js";
import SubMealsRoutes from "./subdescription-meal.admin-route.js";
import IngredientGroupRoutes from "./ingredient-group.admin-route.js";
import IngredientTagRoutes from "./ingredient-tag.admin-route.js";

const AdminRoutes = Router();

const detailRoutes = [
  {
    path: "/admin-auth",
    route: AdminAuthRoutes,
  },
  {
    path: "/customer",
    route: CustomerRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  // New
  {
    path: "/ingredients",
    route: IngredientRoutes,
  },
  {
    path: "/ingredient-group",
    route: IngredientGroupRoutes,
  },
  {
    path: "/ingredient-tag",
    route: IngredientTagRoutes,
  },
  {
    path: "/meals",
    route: MealsRoutes,
  },
  {
    path: "/subdescription-meals",
    route: SubMealsRoutes,
  },
  ////////////
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/partner",
    route: PartnerRoutes,
  },
  {
    path: "/payment-activity",
    route: PaymentActivityRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/service-groups",
    route: ServiceGroupRoutes,
  },
  {
    path: "/service-packages",
    route: ServicePackageRoutes,
  },
  {
    path: "/service-tags",
    route: ServiceTagRoutes,
  },
  {
    path: "/settings",
    route: SettingRoutes,
  },
  {
    path: "/uploads",
    route: UploadRoutes,
  },
];

const notAuthRoutes = [
  {
    path: "/admin-auth",
    route: AdminAuthNotAuthRoutes,
  },
  {
    path: "/settings",
    route: SettingNotAuthRoutes,
  },
  {
    path: "/images",
    route: ImageRoutes,
  },
  {
    path: "/uploads",
    route: UploadNotAuthRoutes,
  },
]

const registerAdminRoutes = (app) => {
  notAuthRoutes.forEach((route) => {
    AdminRoutes.use(route.path, route.route);
  });

  detailRoutes.forEach((route) => {
    AdminRoutes.use(route.path, AdminAuthMiddleware, route.route);
  });

  app.use("/admin-api", AdminRoutes);
}

export default registerAdminRoutes;
