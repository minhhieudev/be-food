import { Router } from "express";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import ServiceTagService from "../../services/service-tag.service.js";
import { CreateServiceTagValidate } from "../../validates/service-tag.validate.js";
const ServiceTagRoutes = Router();

ServiceTagRoutes.get("/", new ServiceTagService().gets);
ServiceTagRoutes.post(
  "/",
  CreateServiceTagValidate,
  ValidateMiddleware,
  new ServiceTagService().create
);

export default ServiceTagRoutes;
