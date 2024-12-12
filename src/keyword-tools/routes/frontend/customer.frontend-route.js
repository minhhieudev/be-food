import { Router } from "express";
const CustomerRoutes = Router();
import customerService from "../../services/customer.service.js";

CustomerRoutes.post(
  "/download-video",
  customerService.getDownloadLink
);

export default CustomerRoutes;
