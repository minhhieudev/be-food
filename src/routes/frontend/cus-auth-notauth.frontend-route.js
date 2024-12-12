import { Router } from "express";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import CusAuthService from "../../services/cus-auth.service.js";
import {
  ChangePasswordByOtpValidate,
  LoginGoogleValidate,
  LoginValidate,
  RegisterValidate,
  SendOtpForgotPasswordValidate,
  VerifyOtpValidate,
} from "../../validates/cus-auth.validate.js";

const CusAuthNotAuthRoutes = Router();

// exclude auth
// đăng nhập
CusAuthNotAuthRoutes.post(
  "/login",
  LoginValidate,
  ValidateMiddleware,
  new CusAuthService().login
);

CusAuthNotAuthRoutes.post(
  "/google-login",
  //LoginGoogleValidate,
  //ValidateMiddleware,
  new CusAuthService().loginByGoogle
);

CusAuthNotAuthRoutes.post(
  "/register",
  RegisterValidate,
  // ValidateMiddleware,
  new CusAuthService().register
);

CusAuthNotAuthRoutes.post(
  "/verify-otp",
  VerifyOtpValidate,
  ValidateMiddleware,
  new CusAuthService().verifyOTP
);

CusAuthNotAuthRoutes.post(
  "/create-password",
  new CusAuthService().createPassword
);

CusAuthNotAuthRoutes.post(
  "/send-otp-update-pass",
  SendOtpForgotPasswordValidate,
  ValidateMiddleware,
  new CusAuthService().sendOtpForgotPassword
);

CusAuthNotAuthRoutes.post(
  "/update-pass-by-otp",
  ChangePasswordByOtpValidate,
  ValidateMiddleware,
  new CusAuthService().changePasswordByOTP
);

export default CusAuthNotAuthRoutes;
