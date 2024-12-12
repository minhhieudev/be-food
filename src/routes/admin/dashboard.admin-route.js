import { Router } from "express";
import DashboardService from "../../services/dasboard.service.js";
const DashboardRoutes = Router();
const dashboardService = new DashboardService();

DashboardRoutes.get(
  "/statistical/system",
  dashboardService.getSystem
);

DashboardRoutes.get(
  "/statistical/order",
  dashboardService.getOrder
);
DashboardRoutes.get("/statistical/platform", dashboardService.getPlatform);
DashboardRoutes.get(
  "/statistical/partner",
  dashboardService.getPartner
);

DashboardRoutes.get(
  "/list/services",
  dashboardService.getServiceList
);
DashboardRoutes.get(
  "/list/customer-recharge",
  dashboardService.getRechargeList
);
DashboardRoutes.get(
  "/list/customer-order",
  dashboardService.getOrderList
);


export default DashboardRoutes;

