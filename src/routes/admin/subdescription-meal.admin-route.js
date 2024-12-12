import { Router } from "express";
import AdminAuthMiddleware from "../middlewares/admin-auth.middleware.js";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import SubMealService from "../../services/subdescription-meal.service.js";
import { CreateMealValidate } from "../../validates/meal.validate.js";

const SubMealRoutes = Router();

SubMealRoutes.get(
  "/getForSelect",
  AdminAuthMiddleware,
  new SubMealService().getForSelect
);

SubMealRoutes.get(
  "/",
  AdminAuthMiddleware,
  new SubMealService().gets
);

SubMealRoutes.get("/:id",
  AdminAuthMiddleware,
  new SubMealService().getOne
);

SubMealRoutes.post(
  "/",
  AdminAuthMiddleware,
  CreateMealValidate,
  ValidateMiddleware,
  new SubMealService().create
);

SubMealRoutes.put(
  "/:id",
  CreateMealValidate,
  ValidateMiddleware,
  new SubMealService().update
);

SubMealRoutes.delete(
  "/:id",
  AdminAuthMiddleware,
  new SubMealService().delete
);

export default SubMealRoutes;
