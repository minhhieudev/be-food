import { Router } from "express";
import AdminAuthMiddleware from "../../routes/middlewares/admin-auth.middleware.js";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import ServiceGroupService from "../../services/service-group.service.js";
import { CreateServiceGroupValidate } from "../../validates/service-group.validate.js";

const ServiceGroupRoutes = Router();

ServiceGroupRoutes.get(
  "/scriptGroupCode",
  new ServiceGroupService().getScriptGroupCode
);

ServiceGroupRoutes.get(
  "/",
  AdminAuthMiddleware,
  new ServiceGroupService().gets
);

ServiceGroupRoutes.post(
  "/",
  AdminAuthMiddleware,
  CreateServiceGroupValidate,
  ValidateMiddleware,
  new ServiceGroupService().create
);

ServiceGroupRoutes.delete(
  "/:id",
  AdminAuthMiddleware,
  new ServiceGroupService().delete
);

export default ServiceGroupRoutes;
