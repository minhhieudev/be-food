import ServiceGroup from "../models/service-group.model.js";
import { caching } from "cache-manager";
import ToolServerAdapter from "../lib/tool-server-api.js";
import _1DgmeService from "./_1dgme.service.js";
import OngtrumService from "./ongtrum.service.js";
const memoryCache = await caching("memory", {
  max: 100,
  ttl: 10 * 1000,
});
import translations from "../common/translate-mess-response.json" assert { type: "json" };

class ServiceGroupService {
  async setScriptGroupCode(req, res, callback = undefined) {
    try {
      const ts = new ToolServerAdapter();

      // getActiveScripts
      const temp = await ts.getActiveScripts();
      if (temp.data?.success) {
        const ttl = 6 * 60 * 1000;
        await memoryCache.set(
          "ScriptGroupCode",
          JSON.stringify(
            temp.data?.scripts.map((x) => {
              return {
                name: x.scriptCode,
                scriptCode: x.scriptCode,
                scriptGroupCode: x.scriptGroupCode,
              };
            })
          ),
          ttl
        );
      }
    } catch (error) {
      console.log({ error });
    }
  }

  async getScriptGroupCode(req, res) {
    try {
      const { partnerCode } = req.query;
     
      let response = [];
      if (partnerCode === "1dg.me") {
        response = await _1DgmeService.getAllServices();
      }
      else if (partnerCode === "ongtrum"){
        const ongtrumService = new OngtrumService();
        response = await ongtrumService.getAllServices();
      } 
      else {
        const scriptGroupCode = await memoryCache.get("ScriptGroupCode");

        if (scriptGroupCode === undefined) {
          const ts = new ToolServerAdapter();
          const ttl = 6 * 60 * 1000;
          // getActiveScripts
          const temp = await ts.getActiveScripts();
          await memoryCache.set(
            "ScriptGroupCode",
            JSON.stringify(
              temp.data?.scripts.map((x) => {
                return {
                  name: x.scriptCode,
                  scriptCode: x.scriptCode,
                  scriptGroupCode: x.scriptGroupCode,
                };
              })
            ),
            ttl
          );

          response = temp.data?.scripts.map((x) => {
            return {
              name: x.scriptCode,
              scriptCode: x.scriptCode,
              scriptGroupCode: x.scriptGroupCode,
            };
          });
        } else {
          response = JSON.parse(scriptGroupCode || "[]");
        }
      }

      res.status(200).json({
        success: true,
        data: { scriptGroupCode: response },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async create(req, res) {
    try {
      const data = req.body;
      const lang = req.header.lang;

      const newData = {
        name: data.name,
      };

      const newServiceGroup = await ServiceGroup.create(newData);

      res.status(200).send({
        success: true,
        message: translations.addSuccess[lang],
        data: newServiceGroup,
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async gets(req, res) {
    try {
      const filter = {};

      const serviceGroups = await ServiceGroup.find(filter)
        .select("-__v -createdAt -updatedAt")
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        data: { serviceGroups },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const lang = req.header.lang;
      const serviceGroup = await ServiceGroup.exists({ _id: id });

      if (!serviceGroup) {
        throw translations.serviceGroupNotExist[lang]
      }

      await ServiceGroup.findOneAndDelete({ _id: id });

      res.status(200).json({
        success: true,
        message: translations.deleteServiceGroupSuccess[lang]
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
}
export default ServiceGroupService;
