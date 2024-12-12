import IngredientTag from "../models/ingredient-tag.js";

class ServiceTagService {
 
  async create(req, res) {
    try {
      const data = req.body;
      const newData = {
        iTagName: data.name,
        color: data.color
      };

      const newIngredientTag = await IngredientTag.create(newData);

      res.status(200).send({
        success: true,
        data: newIngredientTag,
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

      const ingredientListTag = await IngredientTag.find(filter)
        .select("-__v -createdAt -updatedAt")
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        data: { ingredientListTag },
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
      const serviceTag = await IngredientTag.exists({ _id: id });

      if (!serviceTag) {
        throw 'Không tìm thấy nhóm'
      }

      await IngredientTag.findOneAndDelete({ _id: id });

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
export default ServiceTagService;
