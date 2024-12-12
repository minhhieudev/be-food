import { body } from "express-validator";

const CreateServiceGroupValidate = [
  body("name").notEmpty().withMessage("Tên không được để trống"),
];

export { CreateServiceGroupValidate };
