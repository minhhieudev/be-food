import { body } from "express-validator";

const CreateServiceTagValidate = [
  body("name").notEmpty().withMessage("Tên không được để trống"),
];

export { CreateServiceTagValidate };
