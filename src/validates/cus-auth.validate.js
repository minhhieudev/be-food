import { body } from "express-validator";

const ChangePasswordByOtpValidate = [
  body("token").notEmpty().withMessage("Token không được để trống"),
  body("password")
    .notEmpty()
    .withMessage("Mật khẩu mới không được để trống")
    .isLength({ min: 6, max: 24 })
    .withMessage("Mật khẩu mới phải từ 6 đến 24 ký tự")
    .matches(/^[a-zA-Z0-9]*$/)
    .withMessage("Mật khẩu mới không được chứa khoảng trắng và ký tự đặc biệt"),
];

const VerifyOtpValidate = [
  body("email")
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không hợp lệ"),
  body("otp")
    .notEmpty()
    .withMessage("OTP không được để trống")
    .isNumeric()
    .withMessage("Mã OTP phải là số")
    .isLength({ min: 6, max: 6 })
    .withMessage("Mã OTP phải là 6 chữ số"),
];

const RegisterValidate = [
  body("email")
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không hợp lệ"),
  body("password")
    .notEmpty()
    .withMessage("Mật khẩu không được để trống")
    .isLength({ min: 6, max: 24 })
    .withMessage("Mật khẩu phải từ 6 đến 24 ký tự")
    .matches(/^[a-zA-Z0-9]*$/)
    .withMessage("Mật khẩu không được chứa khoảng trắng và ký tự đặc biệt"),
];

const ChangePasswordValidate = [
  body("oldPassword").notEmpty().withMessage("Vui lòng nhập mật khẩu cũ"),
  body("newPassword")
    .notEmpty()
    .withMessage("Mật khẩu mới không được để trống")
    .isLength({ min: 6, max: 24 })
    .withMessage("Mật khẩu mới phải từ 6 đến 24 ký tự")
    .matches(/^[a-zA-Z0-9]*$/)
    .withMessage("Mật khẩu mới không được chứa khoảng trắng và ký tự đặc biệt"),
];

const LoginValidate = [
  body("email").notEmpty().withMessage("Email không được để trống"),
  body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
];

const LoginGoogleValidate = [
  body("token").notEmpty().withMessage("Token không được để trống"),
];

const SendOtpForgotPasswordValidate = [
  body("email")
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không hợp lệ"),
];

export {
  ChangePasswordByOtpValidate,
  VerifyOtpValidate,
  RegisterValidate,
  ChangePasswordValidate,
  LoginValidate,
  LoginGoogleValidate,
  SendOtpForgotPasswordValidate,
};
