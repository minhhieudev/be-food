import { Router } from "express";
import PartnerService from "../../services/partner.service.js";

const PartnerRoutes = Router();

PartnerRoutes.get("/balance/:partnerCode", new PartnerService().getBalance);

export default PartnerRoutes;
