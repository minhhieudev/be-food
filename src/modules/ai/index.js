import AiService from "./services/ai.service";

const servicePublic = {
  ai: new AiService(),
};

const AiModule = {
  service: servicePublic,
};

export default AiModule;
