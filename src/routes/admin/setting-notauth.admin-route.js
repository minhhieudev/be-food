import { Router } from "express";
import SettingService from "../../services/setting.service.js";
const SettingNotAuthRoutes = Router();

const settingService = new SettingService();

SettingNotAuthRoutes.get("/customer", settingService.getByCustomer);
SettingNotAuthRoutes.get("/translate-data", settingService.getTranslateData);

export default SettingNotAuthRoutes;
