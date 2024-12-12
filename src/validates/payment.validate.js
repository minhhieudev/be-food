import { body } from "express-validator";

const RechargeByValidate = [
  body("customerID")
    .optional()
    .isMongoId()
    .withMessage("Mã khách hàng không hợp lệ"),
  body("note")
    .notEmpty()
    .withMessage("Ghi chú không được để trống"),
  body("amount")
    .notEmpty()
    .isNumeric()
    .custom((value) => {
      if (value > 10000000000 || value < -10000000000) {
        throw new Error("Số tiền nhập vào quá lớn");
      } else if (typeof value == "string") {
        throw new Error("Số tiền nhập vào phải là số");
      } else if (value === 0) {
        throw new Error("Số tiền nhập vào phải khác không");
      }
      return true;
    }),
];

export { RechargeByValidate };
