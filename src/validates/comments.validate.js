import { body } from "express-validator";

const GenerateCommentValidate = [
  body("keyword")
    .notEmpty()
    .isString()
    .withMessage("Từ khoá không được để trống"),
  body("maxCount")
    .optional()
    .isNumeric()
    .withMessage("Số lượng tối đa phải là số"),
  body("style").optional().isString().withMessage("Phong cách không hợp lệ"),
  body("type").optional().isString().withMessage("Loại bình luận không hợp lệ"),
];

export { GenerateCommentValidate };
