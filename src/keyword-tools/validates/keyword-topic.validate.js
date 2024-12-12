import { body, param } from "express-validator";
import { ValidateMongoID } from "./index.js";

const CreateKeywordTopicValidate = [
  body("topicName").notEmpty().withMessage("Tên chủ đề không được để trống"),
];

const UpdateKeywordTopicValidate = [
  param("id").isMongoId().withMessage("ID không hợp lệ"),
];

export {
  CreateKeywordTopicValidate,
  ValidateMongoID,
  UpdateKeywordTopicValidate,
};
