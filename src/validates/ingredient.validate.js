import { body } from "express-validator";

const CreateIngredientValidate = [
  body("name").notEmpty().withMessage("Tên không được để trống"),
];

export { CreateIngredientValidate };
