import { Router } from "express";
import AdminAuthMiddleware from "../middlewares/admin-auth.middleware.js";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import ServiceTagService from "../../services/ingredient-tag.service.js";
import { CreateServiceGroupValidate } from "../../validates/service-group.validate.js";

const IngredientTagRoutes = Router();

IngredientTagRoutes.get(
  "/",
  AdminAuthMiddleware,
  new ServiceTagService().gets
);

IngredientTagRoutes.post(
  "/",
  AdminAuthMiddleware,
  ValidateMiddleware,
  new ServiceTagService().create
);

IngredientTagRoutes.delete(
  "/:id",
  AdminAuthMiddleware,
  new ServiceTagService().delete
);

export default IngredientTagRoutes;
