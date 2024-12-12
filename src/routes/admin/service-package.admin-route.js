import { Router } from "express";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import ServicePackageService from "../../services/service-package.service.js";
import {
  CreateServicePackageValidate,
  UpdateServicePackageValidate,
} from "../../validates/service-package.validate.js";

import MediaUploadService from "../../services/media-upload.service.js";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const ServicePackageRoutes = Router();

// ADMIN
ServicePackageRoutes.get("/", new ServicePackageService().gets);

ServicePackageRoutes.post(
  "/",
  CreateServicePackageValidate,
  ValidateMiddleware,
  new ServicePackageService().create
);

ServicePackageRoutes.post(
  "/upload",
  upload.single('file'),
  new MediaUploadService().uploadImageTemp
);

ServicePackageRoutes.post(
  "/bulk-create",
  new ServicePackageService().createMany
);

ServicePackageRoutes.get("/:id", new ServicePackageService().getOne);

ServicePackageRoutes.put(
  "/:id",
  UpdateServicePackageValidate,
  ValidateMiddleware,
  new ServicePackageService().update
);

ServicePackageRoutes.delete("/:id", new ServicePackageService().delete);

ServicePackageRoutes.delete(
  "/remove-partner/:partnerCode",
  new ServicePackageService().deletePartner
);

export default ServicePackageRoutes;
