import { Router } from "express";
import SettingService from "../../services/setting.service.js";
const SettingRoutes = Router();

const settingService = new SettingService();

SettingRoutes.get("/customer/get-qr-bank/:amount", settingService.getQRBank);
export default SettingRoutes;
