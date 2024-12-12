import { Router } from "express";
import SettingService from "../../services/setting.service.js";
const SettingRoutes = Router();

const settingService = new SettingService();

SettingRoutes.get("/", settingService.get).put("/", settingService.update);

SettingRoutes.get(
  "/ongtrum/getImportServiceList",
  settingService.getImportServiceList
);

SettingRoutes.get(
  "/getPaymentActivity/:partner",
  settingService.getPaymentActivity
);

export default SettingRoutes;
