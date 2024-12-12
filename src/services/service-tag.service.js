import ServiceTag from "../models/service-tag.model.js";
import translations from "../common/translate-mess-response.json" assert { type: "json" };

class ServiceTagService {
  async create(req, res) {
    try {
      const data = req.body;
      const lang = req.header.lang;
      const newData = {
        name: data.name,
      };

      await ServiceTag.create(newData);

      res.status(200).send({
        success: true,
        message: translations.addSuccess[lang],
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

      const serviceTags = await ServiceTag.find(filter).select("-__v").sort({createdAt: -1}).lean();

      res.status(200).json({
        success: true,
        data: { serviceTags },
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
export default ServiceTagService;
