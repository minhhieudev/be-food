import { Router } from "express";
import RateService from "../../services/rate.service.js";

const RateRoutes = Router();

const rateService = new RateService();

RateRoutes.get("/", rateService.gets);

RateRoutes.get("/detail", rateService.getDetail);

export default RateRoutes;
