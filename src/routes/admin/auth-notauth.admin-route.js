import { Router } from "express";
import AdminAuthService from "../../services/admin-auth.service.js";
const AdminAuthNotAuthRoutes = Router();
const adminAuthService = new AdminAuthService();

// đăng ký tài khoản
AdminAuthNotAuthRoutes.post("/register", adminAuthService.register);

// đăng nhập
AdminAuthNotAuthRoutes.post("/login", adminAuthService.login);

// làm mới access token
AdminAuthNotAuthRoutes.post("/refresh-token", adminAuthService.refreshToken);

AdminAuthNotAuthRoutes.post(
    "/register/verify-email",
    adminAuthService.verifyEmailRegister
  );

export default AdminAuthNotAuthRoutes;
