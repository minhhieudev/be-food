import { Router } from "express";
import IngredientTagService from "../../services/ingredient-tag.service.js";

const IngredientTagRoutes = Router();

IngredientTagRoutes.get("/customers", new IngredientTagService().gets);
export default IngredientTagRoutes;
