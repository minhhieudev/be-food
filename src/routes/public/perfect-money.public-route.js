import { Router } from "express";
import PerfectMoneyService from "../../services/perfect-money.service.js";
const PerfectMoneyRoutes = Router();
const perfectMoneyService = new PerfectMoneyService();

// recharge
// update create form when change path check api 
PerfectMoneyRoutes.post("/check", perfectMoneyService.check);

export default PerfectMoneyRoutes;
