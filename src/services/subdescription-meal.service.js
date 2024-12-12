import SubMeal from "../models/subdescription-meal.model.js";
import { caching } from "cache-manager";
import translations from "../common/translate-mess-response.json" assert { type: "json" };

const memoryCache = await caching("memory", {
  max: 100,
  ttl: 10 * 1000,
});

class SubMealService {

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

      // Check cache 
      const cacheKey = search ? null : "SubMeals";
      let meals;
      if (cacheKey) {
        meals = await memoryCache.get(cacheKey);
      }

      if (!meals) {
        meals = await SubMeal.find(filter)
          .select("-__v -createdAt -updatedAt")
          .sort({ createdAt: -1 })
          .lean()
          .skip(skip)
          .limit(pageSize);

        if (cacheKey) {
          const ttl = 6 * 60 * 1000;
          await memoryCache.set(cacheKey, meals, ttl);
        }
      }

      const total = await SubMeal.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      res.status(200).json({
        success: true,
        data: { meals, pagination },
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
      const meal = await SubMeal.findOne({ _id: id })
        .select("-__v -createdAt -updatedAt -serviceGroup")
        .lean();

      if (!meal) throw "Thành phần không tồn tại";

      res.status(200).send({
        success: true,
        data: { meal },
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

      const newSubMeal = new SubMeal(data);
      await newSubMeal.save();

      // Clear cache
      await memoryCache.del("SubMeals");

      res.status(200).send({
        success: true,
        message: translations.addSuccess[lang],
        data: newSubMeal,
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

      const updatedSubMeal = await SubMeal.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updatedSubMeal) {
        throw translations.mealNotExist[lang];
      }

      // Clear cache
      await memoryCache.del("SubMeals");

      res.status(200).send({
        success: true,
        message: translations.updateSuccess[lang],
        data: updatedSubMeal,
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

      const meal = await SubMeal.exists({ _id: id });

      if (!meal) {
        throw translations.mealNotExist[lang];
      }

      await SubMeal.findOneAndDelete({ _id: id });

      // Clear cache
      await memoryCache.del("SubMeals");

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


  // New method to get names and ids of all sub meals
  async getForSelect(req, res) {
    try {
      const subMeals = await SubMeal.find()
        .select("_id name")
        .lean();

      res.status(200).json({
        success: true,
        data: { subMeals },
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

export default SubMealService;
