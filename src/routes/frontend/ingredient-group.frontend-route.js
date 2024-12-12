import { Router } from "express";
import IngredientGroupService from "../../services/ingredient-group.service.js";

const IngredientGroupRoutes = Router();

IngredientGroupRoutes.get("/customers", new IngredientGroupService().gets);
export default IngredientGroupRoutes;
