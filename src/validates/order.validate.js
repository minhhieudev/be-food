import { body } from "express-validator";
import _ from "lodash";
import mongoose from "mongoose";

const CreateOrderValidate = [
  body("serviceID").optional().isMongoId().withMessage("Dịch vụ không hợp lệ"),
  body("qty")
    .notEmpty()
    .custom((value) => {
      if (value <= 0) {
        throw new Error("Số lượng phải lớn hơn 0");
      } else if (typeof value == "string") {
        throw new Error("Số lượng nhập vào phải là số");
      }
      return true;
    })
    .isInt()
    .withMessage("Số lượng phải là số nguyên"),
  body("comments")
    .optional()
    .custom((value) => {
      if (!_.isArray(value)) {
        throw new Error("Danh sách bình luận không hợp lệ");
      }
      for (const comment of value) {
        if (typeof comment !== 'string') {
          throw new Error("Danh sách bình luận không hợp lệ");
        } 
      }
      return true
    })
];

const OrderStatusValidate = [
  body("orderIds")
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error("orderIds must be an array");
      }
      if (value.length === 0) {
        throw new Error("orderIds array cannot be empty");
      }
      for (const id of value) {
        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Each orderId must be a valid ObjectId");
        }
      }
      return true;
    }),
];

export { CreateOrderValidate, OrderStatusValidate };
