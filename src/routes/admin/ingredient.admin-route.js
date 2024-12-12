import { Router } from "express";
import AdminAuthMiddleware from "../middlewares/admin-auth.middleware.js";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import IngredientService from "../../services/ingredient.service.js";
import { CreateIngredientValidate } from "../../validates/ingredient.validate.js";

const IngredientRoutes = Router();

// IngredientRoutes.get(
//   "/ingredients",
//   new IngredientService().getIngredients
// );

IngredientRoutes.get(
  "/",
  AdminAuthMiddleware,
  new IngredientService().gets
);

IngredientRoutes.get("/:id", new IngredientService().getOne);

IngredientRoutes.get("/getIngredients/select",
  AdminAuthMiddleware,
  new IngredientService().getIngredients);


IngredientRoutes.post(
  "/",
  AdminAuthMiddleware,
  CreateIngredientValidate,
  ValidateMiddleware,
  new IngredientService().create
);

IngredientRoutes.put(
  "/:id",
  CreateIngredientValidate,
  ValidateMiddleware,
  new IngredientService().update
);

IngredientRoutes.delete(
  "/:id",
  AdminAuthMiddleware,
  new IngredientService().delete
);

export default IngredientRoutes;
