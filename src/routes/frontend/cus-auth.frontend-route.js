import { Router } from "express";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import CusAuthService from "../../services/cus-auth.service.js";
import {
  ChangePasswordByOtpValidate,
  ChangePasswordValidate,
  LoginGoogleValidate,
  LoginValidate,
  RegisterValidate,
  SendOtpForgotPasswordValidate,
  VerifyOtpValidate,
} from "../../validates/cus-auth.validate.js";

const CusAuthRoutes = Router();

// Đổi mật khẩu
// CusAuthRoutes.post(
//   "/change-password",
//   ChangePasswordValidate,
//   ValidateMiddleware,
//   new CusAuthService().changePassword
// );


CusAuthRoutes.post(
  "/profile",
  ValidateMiddleware,
  new CusAuthService().profile
);

CusAuthRoutes.post("/refresh-api-key", new CusAuthService().refreshApiKey);

CusAuthRoutes.post("/get-api-key", new CusAuthService().getCurrentApiKey);

// exclude auth
// đăng nhập
CusAuthRoutes.post(
  "/login",
  LoginValidate,
  ValidateMiddleware,
  new CusAuthService().login
);

CusAuthRoutes.post(
  "/google-login",
  LoginGoogleValidate,
  ValidateMiddleware,
  new CusAuthService().loginByGoogle
);

CusAuthRoutes.post(
  "/register",
  RegisterValidate,
  ValidateMiddleware,
  new CusAuthService().register
);

CusAuthRoutes.post(
  "/verify-otp",
  VerifyOtpValidate,
  ValidateMiddleware,
  new CusAuthService().verifyOTP
);

CusAuthRoutes.post("/create-password", new CusAuthService().createPassword);

CusAuthRoutes.post(
  "/send-otp-update-pass",
  SendOtpForgotPasswordValidate,
  ValidateMiddleware,
  new CusAuthService().sendOtpForgotPassword
);

CusAuthRoutes.post(
  "/update-pass-by-otp",
  ChangePasswordByOtpValidate,
  ValidateMiddleware,
  new CusAuthService().changePasswordByOTP
);

export default CusAuthRoutes;
