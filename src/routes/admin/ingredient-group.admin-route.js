import { Router } from "express";
import AdminAuthMiddleware from "../middlewares/admin-auth.middleware.js";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import IngredientGroupIngredient from "../../services/ingredient-group.service.js";
import { CreateServiceGroupValidate } from "../../validates/service-group.validate.js";

const IngredientGroupRoutes = Router();

IngredientGroupRoutes.get(
  "/",
  AdminAuthMiddleware,
  new IngredientGroupIngredient().gets
);

IngredientGroupRoutes.post(
  "/",
  AdminAuthMiddleware,
  ValidateMiddleware,
  new IngredientGroupIngredient().create
);

IngredientGroupRoutes.delete(
  "/:id",
  AdminAuthMiddleware,
  new IngredientGroupIngredient().delete
);

export default IngredientGroupRoutes;
