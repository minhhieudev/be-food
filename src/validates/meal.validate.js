import { body } from "express-validator";

const CreateMealValidate = [
  body("name").notEmpty().withMessage("Tên không được để trống"),
  body("totalDate").isInt({ min: 1 }).withMessage("Tổng số ngày phải là số nguyên dương"),
  body("mealsPerDay").isInt({ min: 1 }).withMessage("Số bữa ăn mỗi ngày phải là số nguyên dương"),
  body("totalSub").isInt({ min: 0 }).withMessage("Tổng số lượt đăng ký phải là số nguyên không âm"),
];

export { CreateMealValidate };
