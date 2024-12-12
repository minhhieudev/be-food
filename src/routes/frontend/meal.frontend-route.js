import { Router } from "express";
import MealService from '../../services/meal.service.js';


const Routes = Router();

Routes.get(
  "/:id",
  new MealService().gets
);
Routes.get(
  '/customers/:id',
  new MealService().getOne
);
Routes.post(
  "/",
  new MealService().create
);

Routes.post(
  "/update-favorite-ingredients",
  new MealService().updateFavoriteIngredients
);

Routes.post(
  "/update-delivery-time",
  new MealService().updateDeliveryTime
);

Routes.post(
  "/review",
  new MealService().addReview
);

Routes.post(
  "/cancel",
  new MealService().cancelMeal
);

export default Routes;
