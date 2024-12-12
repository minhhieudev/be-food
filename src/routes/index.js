import registerAdminRoutes from "./admin/index.js";
import registerFrontendRoutes from "./frontend/index.js";
import registerPublicRoutes from "./public/index.js";

const registerRoutes = (app) => {
  registerFrontendRoutes(app);
  registerAdminRoutes(app);
  registerPublicRoutes(app);
};

export default registerRoutes;
