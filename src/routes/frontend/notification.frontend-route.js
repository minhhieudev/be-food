import { Router } from "express";
import NotificationService from "../../services/notification.service.js";
const NotificationRoutes = Router();

NotificationRoutes.get("/customer", new NotificationService().gets);

export default NotificationRoutes;
