import { Router } from "express";
import PerfectMoneyService from "../../services/perfect-money.service.js";
const PerfectMoneyRoutes = Router();
const perfectMoneyService = new PerfectMoneyService();

PerfectMoneyRoutes.post("/get-form", perfectMoneyService.getForm);

export default PerfectMoneyRoutes;
