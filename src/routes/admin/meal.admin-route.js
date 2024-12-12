import { Router } from "express";
import AdminAuthMiddleware from "../middlewares/admin-auth.middleware.js";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import MealService from "../../services/meal.service.js";
import { CreateMealValidate } from "../../validates/meal.validate.js";

const MealRoutes = Router();

MealRoutes.get(
  "/",
  AdminAuthMiddleware,
  new MealService().getAll
);

MealRoutes.get("/:id",
  AdminAuthMiddleware,
  new MealService().getOne
);

MealRoutes.post(
  "/",
  AdminAuthMiddleware,
  CreateMealValidate,
  ValidateMiddleware,
  new MealService().create
);

MealRoutes.put(
  "/updateStatus/:id",
  // CreateMealValidate,
  // ValidateMiddleware,
  new MealService().updateStatus
);

MealRoutes.put(
  "/:id",
  CreateMealValidate,
  ValidateMiddleware,
  new MealService().update
);


MealRoutes.delete(
  "/:id",
  AdminAuthMiddleware,
  new MealService().delete
);

export default MealRoutes;
