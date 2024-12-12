import { param } from "express-validator";

const ValidateMongoID = [
  param("id").isMongoId().withMessage("ID không hợp lệ"),
];

export { ValidateMongoID };
