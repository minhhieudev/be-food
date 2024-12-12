import IngredientGroup from "../models/ingredient-group.js";
import { caching } from "cache-manager";
import ToolServerAdapter from "../lib/tool-server-api.js";
import _1DgmeService from "./_1dgme.service.js";


class ServiceGroupService {
 
  async create(req, res) {
    console.log('123')
    try {
      const data = req.body;
      const newData = {
        name: data.name,
      };
      console.log(req.body)

      const newIngredientGroup = await IngredientGroup.create(newData);

      res.status(200).send({
        success: true,
        data: newIngredientGroup,
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

      const ingredientListGroup = await IngredientGroup.find(filter)
        .select("-__v -createdAt -updatedAt")
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        data: { ingredientListGroup },
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
      const serviceGroup = await IngredientGroup.exists({ _id: id });

      if (!serviceGroup) {
        throw 'Không tìm thấy nhóm'
      }

      await IngredientGroup.findOneAndDelete({ _id: id });

      res.status(200).json({
        success: true,
        message: 'Successfully'
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
