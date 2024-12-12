import { body, param } from "express-validator";
import { ValidateMongoID } from "./index.js";

const CreateKeywordValidate = [
  body("topicCode")
    .isMongoId()
    .optional()
    .withMessage("Mã chủ đề không hợp lệ"),
  body("keyword").notEmpty().withMessage("Từ khoá không được để trống"),
];

const UpdateKeywordValidate = [
  body("topicCode")
    .isMongoId()
    .optional()
    .withMessage("Mã chủ đề không hợp lệ"),
  param("id").isMongoId().withMessage("ID không hợp lệ"),
];

export { CreateKeywordValidate, ValidateMongoID, UpdateKeywordValidate };

