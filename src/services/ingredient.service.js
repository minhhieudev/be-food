import Ingredient from "../models/Ingredient.model.js";
import translations from "../common/translate-mess-response.json" assert { type: "json" };

class IngredientService {
  async gets(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const skip = (page - 1) * pageSize;
      const { search } = req.query;

      let filter = {};

      // Check for search 
      if (search) {
        const searchFields = ["name"];
        const cond = searchFields.map((field) => {
          return { [field]: { $regex: new RegExp(search, "i") } };
        });
        filter = { $or: cond };
      }

      const ingredients = await Ingredient.find(filter)
        .select("-__v -createdAt -updatedAt")
        .populate({
          path: 'iGroupID',
          select: '-createdAt -updatedAt -__v',
        })
        .populate({
          path: 'iTags',
          select: '-createdAt -updatedAt -__v',
        })
        .sort({ createdAt: -1 })
        .lean()
        .skip(skip)
        .limit(pageSize);

      const total = await Ingredient.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      res.status(200).json({
        success: true,
        data: { ingredients, pagination },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const ingredient = await Ingredient.findOne({ _id: id })
        .select("-__v -createdAt -updatedAt -serviceGroup")
        .lean();

      if (!ingredient) throw "Thành phần không tồn tại";

      res.status(200).send({
        success: true,
        data: { ingredient },
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
      const lang = req.headers.lang;

      const newIngredient = new Ingredient(data);
      await newIngredient.save();

      res.status(200).send({
        success: true,
        message: translations.addSuccess[lang],
        data: newIngredient,
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

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const lang = req.headers.lang || "en";

      const updatedIngredient = await Ingredient.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updatedIngredient) {
        throw translations.ingredientNotExist[lang];
      }

      res.status(200).send({
        success: true,
        message: translations.updateSuccess[lang],
        data: updatedIngredient,
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(500).send({
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
      const lang = req.headers.lang || "en";

      const ingredient = await Ingredient.exists({ _id: id });

      if (!ingredient) {
        throw translations.ingredientNotExist[lang];
      }

      await Ingredient.findOneAndDelete({ _id: id });

      res.status(200).json({
        success: true,
        message: translations.deleteSuccess[lang],
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

  async getIngredients(req, res) {
    try {
      const ingredients = await Ingredient.find({})
      .lean()
      .select("_id name")
      .populate({
        path: 'iTags',
        select: '-createdAt -updatedAt',
      })

      res.status(200).send({
        success: true,
        data: { ingredients },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
}

export default IngredientService;
