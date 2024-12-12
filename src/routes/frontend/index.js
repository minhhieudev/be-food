import { Router } from "express";
import FrontendAuthMiddleware from "../middlewares/frontend-auth.middleware.js";
import ChannelRoutes from "./channel.frontend-route.js";
import CommentsRoutes from "./comments.frontend-route.js";
import CusAuthNotAuthRoutes from "./cus-auth-notauth.frontend-route.js";
import CusAuthRoutes from "./cus-auth.frontend-route.js";
import CustomerNotAuthRoutes from "./customer-notauth.frontend-route.js";
import CustomerRoutes from "./customer.frontend-route.js";
import ImageRoutes from "./image.frontend-route.js";
import NotificationRoutes from "./notification.frontend-route.js";
import OrderRoutes from "./order.frontend-route.js";
import PaymentActivityRoutes from "./payment-activity.frontend-route.js";
import PaymentRoutes from "./payment.frontend-route.js";
import PerfectMoneyRoutes from "./perfect-money.frontend-route.js";
import RateRoutes from "./rate.frontend-route.js";
import ServiceGroupRoutes from "./service-group.frontend-route.js";
import IngredientGroupRoutes from "./ingredient-group.frontend-route.js";
import IngredientTagRoutes from "./ingredient-tag.frontend-route.js";
import ServicePackageRoutes from "./service-package.frontend-route.js";
import SettingNotAuthRoutes from "./setting-notauth.frontend-route.js";
import SettingRoutes from "./setting.frontend-route.js";
import UploadNotAuthRoutes from "./upload-notauth.frontend-route.js";
import WalletRoutes from "./wallet.fontend-route.js";
import ServiceRoutes from "./service.fronted-route.js";
import MealRoutes from './meal.frontend-route.js'

const FrontendRoutes = Router();

const detailRoutes = [
  {
    path: "/channel",
    route: ChannelRoutes,
  },
  {
    path: "/comments",
    route: CommentsRoutes,
  },
  {
    path: "/customer-auth",
    route: CusAuthRoutes,
  },
  {
    path: "/customer",
    route: CustomerRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
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
    path: "/perfect-money",
    route: PerfectMoneyRoutes,
  },
  {
    path: "/rates",
    route: RateRoutes,
  },
  {
    path: "/service-groups",
    route: ServiceGroupRoutes,
  },
  {
    path: "/ingredient-groups",
    route: IngredientGroupRoutes,
  },
  {
    path: "/ingredient-tags",
    route: IngredientTagRoutes,
  },
  {
    path: "/service-packages",
    route: ServicePackageRoutes,
  },
  {
    path: "/settings",
    route: SettingRoutes,
  },
  {
    path: "/wallets",
    route: WalletRoutes,
  },
  {
    path: "/meal",
    route: MealRoutes,
  },
];

const notAuthRoutes = [
  {
    path: "/customer-auth",
    route: CusAuthNotAuthRoutes,
  },
  {
    path: "/customer",
    route: CustomerNotAuthRoutes,
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
  {
    path: "/public-services",
    route: ServiceRoutes,
  },
];

const registerFrontendRoutes = (app) => {
  notAuthRoutes.forEach((route) => {
    FrontendRoutes.use(route.path, route.route);
  });

  detailRoutes.forEach((route) => {
    FrontendRoutes.use(route.path, FrontendAuthMiddleware, route.route);
  });

  app.use("/frontend-api", FrontendRoutes);
};

export default registerFrontendRoutes;
