import { body } from "express-validator";
import { TypeEnum, DataType } from "../common/service-package.enum.js";
import _ from "lodash";

const CreateServicePackageValidate = [
  body("type")
    .notEmpty()
    .withMessage("Loại dịch vụ không được để trống")
    .custom((value) => TypeEnum.includes(value))
    .withMessage("Loại dịch vụ không hợp lệ"),
  body("status").optional().isBoolean().withMessage("Trạng thái không hợp lệ"),
  //body("scriptGroupCode").notEmpty().withMessage("Dịch vụ không được để trống"),
  body("serviceGroupID").isMongoId().withMessage("Nhóm dịch vụ không hợp lệ"),
  body("price").isNumeric().withMessage("Giá phải là số"),
  body("name")
    .isLength({ min: 1, max: 225 })
    .withMessage("Tên phải từ 1 đến 225 ký tự"),
  body("attributes")
    .optional()
    .custom((value) => {
      const invalidValues = value.filter(
        (item) => !DataType.includes(item.dataType)
      );
      if (invalidValues.length > 0) {
        return false;
      }
      return true;
    })
    .withMessage("Kiểu dữ liệu của thuộc tính không hợp lệ"),
  body("minValue")
    .optional()
    .isNumeric()
    .withMessage("Số lượng tối thiểu phải là số")
    .custom((value) => {
      if (value < 0 || (value && !Number(value))) {
        throw new Error("Số lượng tối thiểu không hợp lệ");
      }
      return true;
    }),
  body("maxValue")
    .optional()
    .isNumeric()
    .withMessage("Số lượng tối đa phải là số")
    .custom((value, { req }) => {
      if (value < 0 || (value && !Number(value))) {
        throw new Error("Số lượng tối đa không hợp lệ");
      }
      if (req.body.minValue && req.body.minValue >= value) {
        throw new Error("Số lượng tối đa phải lơn hơn số lượng tối thiểu");
      }
      return true;
    }),
];

const UpdateServicePackageValidate = [
  body("type")
    .optional()
    .custom((value) => TypeEnum.includes(value))
    .withMessage("Loại dịch vụ không hợp lệ"),
  body("status").optional().isBoolean().withMessage("Trạng thái không hợp lệ"),
  body("scriptGroupCode").optional(),
  body("serviceGroupID")
    .optional()
    .isMongoId()
    .withMessage("Mã nhóm dịch vụ không hợp lệ"),
  body("price").optional().isNumeric().withMessage("Giá phải là số"),
  body("name")
    .optional()
    .isLength({ min: 1, max: 225 })
    .withMessage("Tên phải từ 1 đến 225 ký tự"),
  body("attributes")
    .optional()
    .custom((value) => {
      const invalidValues = value.filter(
        (item) => !DataType.includes(item.dataType)
      );
      if (invalidValues.length > 0) {
        return false;
      }
      return true;
    })
    .withMessage("Kiểu dữ liệu của thuộc tính không hợp lệ"),
  body("minValue")
    .optional()
    .isNumeric()
    .withMessage("Số lượng tối thiểu phải là số")
    .custom((value) => {
      if (value < 0 || !_.isNumber(value)) {
        throw new Error("Số lượng tối thiểu không hợp lệ");
      }
      return true;
    }),
  body("maxValue")
    .optional()
    .isNumeric()
    .withMessage("Số lượng tối đa phải là số")
    .custom((value, { req }) => {
      if (value < 0 || !_.isNumber(value)) {
        throw new Error("Số lượng tối đa không hợp lệ");
      }
      if (req.body.minValue && req.body.minValue >= value) {
        throw new Error("Số lượng tối đa phải lơn hơn số lượng tối thiểu");
      }
      return true;
    }),
];

export { CreateServicePackageValidate, UpdateServicePackageValidate };
