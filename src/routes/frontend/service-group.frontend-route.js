import { Router } from "express";
import ServiceGroupService from "../../services/service-group.service.js";

const ServiceGroupRoutes = Router();

ServiceGroupRoutes.get("/customers", new ServiceGroupService().gets);
export default ServiceGroupRoutes;
