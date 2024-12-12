import { Router } from "express";
import ServicePackageService from "../../services/service-package.service.js";

const ServiceRoutes = Router();

ServiceRoutes.get(
  "/platform",
  new ServicePackageService().getServicePackagePublic
);
ServiceRoutes.get(
  "/platform/:platform",
  new ServicePackageService().getServicePackagePublicByPlatform
);

export default ServiceRoutes;
