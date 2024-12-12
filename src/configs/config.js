import env from "../utils/env.js";
const dev = {
  domain: {
    fe: env("DEV_FE_DOMAIN"),
  },
  app: {
    port: env("DEV_APP_PORT"),
  },
  connections: {
    mongoConnectionString: env("DEV_MONGO_CONNECTION_STRING"),
    mongoDBName: env("DEV_MONGO_DB_NAME"),
  },
  api: {
    admin: {
      accessTokenKey: env("DEV_ADMIN_ACCESS_TOKEN"),
      refreshTokenKey: env("DEV_ADMIN_REFRESH_TOKEN"),
      registerEmailKey: env("DEV_CUS_SEND_EMAIL_REGISTER_SECRET"),
      sendEmailForgotPasswordKey: env("DEV_CUS_SEND_EMAIL_FORGOT_PW_SECRET"),
      updatePwForgotKey: env("DEV_CUS_UPDATE_PW_FORGOT_SECRET"),
    },
    customer: {
      accessTokenKey: env("DEV_CUS_ACCESS_TOKEN"),
      refreshTokenKey: env("DEV_CUS_REFRESH_TOKEN"),
    },
  },
  paypal: {
    apiLogin: env("DEV_PP_API_LOGIN"),
    apiCheckOrder: env("DEV_PP_API_CHECK_ORDER"),
  },
  keywordTool: {
    limitData: env("DEV_KEYWORD_TOOL_LIMIT") || 10,
    rapidApiKey: env("DEV_RAPID_API_KEY"),
  },
  rate: {
    rateApiKey: env("DEV_RATE_API_KEY"),
    rateApiHost: env("DEV_RATE_API_HOST"),
    rateApi: env("DEV_RATE_API"),
  },
  serverTool: {
    url: env("DEV_TOOL_SERVER_API"),
  },
  "1dgme": {
    APIKey: env("DEV_1DGME_API_KEY"),
  },
  chatGPT: {
    APIKey: env("DEV_DEFAULT_CHATGPT_API_KEY"),
  },
  redis: {
    url: env("DEV_REDIS_URL") || "redis://127.0.0.1:6379",
  },
};

const product = {
  app: {
    port: env("PRO_APP_PORT"),
  },
  connections: {
    mongoConnectionString: env("PRO_MONGO_CONNECTION_STRING") || "",
    mongoDBName: env("PRO_MONGO_DB_NAME"),
  },
  api: {
    admin: {
      accessTokenKey: env("PRO_ADMIN_ACCESS_TOKEN"),
      refreshTokenKey: env("PRO_ADMIN_REFRESH_TOKEN"),
    },
    customer: {
      accessTokenKey: env("PRO_CUS_ACCESS_TOKEN"),
      refreshTokenKey: env("PRO_CUS_REFRESH_TOKEN"),
    },
  },
  paypal: {
    username: env("PRO_PP_USERNAME"),
    password: env("PRO_PP_PASSWORD"),
    apiLogin: env("PRO_PP_API_LOGIN"),
    apiCheckOrder: env("PRO_PP_API_CHECK_ORDER"),
  },
  keywordTool: {
    limitData: env("PRO_KEYWORD_TOOL_LIMIT") || 10,
    rapidApiKey: env("PRO_RAPID_API_KEY"),
  },
  rate: {
    rateApiKey: env("PRO_RATE_API_KEY"),
    rateApiHost: env("PRO_RATE_API_HOST"),
    rateApi: env("PRO_RATE_API"),
  },
  serverTool: {
    url: env("PRO_TOOL_SERVER_API"),
  },
  "1dgme": {
    APIKey: env("PRO_1DGME_API_KEY"),
  },
  chatGPT: {
    APIKey: env("PRO_DEFAULT_CHATGPT_API_KEY"),
  },
  redis: {
    url: env("PRO_REDIS_URL"),
  },
};

const config = { dev, product };
const currentEnv = process.env.SC_TOOL_ENV || "dev";
export default config[currentEnv];
