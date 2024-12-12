import registerAdminKeywordToolRoutes from "./admin/index.js";
import registerFrontendKeywordToolRoutes from "./frontend/index.js";

// eslint-disable-next-line no-unused-vars
import jobs from '../jobs/index.js'

const registerKeywordToolRoutes = (app) => {
  registerAdminKeywordToolRoutes(app);
  registerFrontendKeywordToolRoutes(app);
};

export { registerKeywordToolRoutes };
