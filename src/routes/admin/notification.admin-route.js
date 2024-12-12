import { Router } from "express";
import NotificationService from "../../services/notification.service.js";
const NotificationRoutes = Router();

NotificationRoutes.get("/", new NotificationService().gets);

NotificationRoutes.get("/:id", new NotificationService().getOne);

NotificationRoutes.post("/", new NotificationService().create);

NotificationRoutes.put("/:id", new NotificationService().update);

NotificationRoutes.delete("/:id", new NotificationService().delete);

export default NotificationRoutes;
