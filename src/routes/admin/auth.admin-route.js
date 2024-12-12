import { Router } from "express";
import AdminAuthService from "../../services/admin-auth.service.js";
const AdminAuthRoutes = Router();
const adminAuthService = new AdminAuthService();

// thay đổi mật khẩu
AdminAuthRoutes.post("/change-password", adminAuthService.changePassword);

export default AdminAuthRoutes;
