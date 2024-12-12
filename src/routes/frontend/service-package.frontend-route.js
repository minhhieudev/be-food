import { Router } from "express";
import ServicePackageService from "../../services/service-package.service.js";
import {
  CreateServicePackageValidate
} from "../../validates/service-package.validate.js";
const ServicePackageRoutes = Router();

// CUSTOMER
ServicePackageRoutes.get(
  "/customers",
  new ServicePackageService().getAll
);

ServicePackageRoutes.get(
  "/customers/hot",
  CreateServicePackageValidate,
  new ServicePackageService().servicePackageHot
);

ServicePackageRoutes.get(
  "/customers/:id",
  new ServicePackageService().getOneByCustomer
);

export default ServicePackageRoutes;
