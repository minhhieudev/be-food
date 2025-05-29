import Meal from "../models/meal.model.js";
import MealReviewModel from "../models/meal-review.model.js";
import { caching } from "cache-manager";
import translations from "../common/translate-mess-response.json" assert { type: "json" };
import Order from "../models/order.model.js";

const memoryCache = await caching("memory", {
  max: 100,
  ttl: 10 * 1000,
});

class MealService {

  async updateFavoriteIngredients(req, res) {
    const { favoriteIngredients, mealID } = req.body;
  
    try {
      if (favoriteIngredients && mealID) {
        // 1. Lấy tài liệu trước khi cập nhật
        const mealBeforeUpdate = await Meal.findOne({ _id: mealID });
  
        // 2. Cập nhật tài liệu
        const updateResult = await Meal.updateOne(
          { _id: mealID },
          { favoriteIngredients: favoriteIngredients }
        );
  
        // Kiểm tra nếu có tài liệu được cập nhật
        if (updateResult.modifiedCount > 0) {
          console.log('Update successful!');
  
          // 3. Lấy tài liệu sau khi cập nhật
  
          return res.status(200).json({
            success: true,
          });
        } else {
          console.log('No document was updated. Check if mealID exists or if the data is the same.');
          return res.status(200).json({
            success: false,
            message: 'No document was updated.',
          });
        }
      } else {
        console.log('Validation failed: favoriteIngredients or mealID is missing.');
        return res.status(400).json({
          success: false,
          message: 'Invalid request: favoriteIngredients and mealID are required.',
        });
      }
    } catch (error) {
      console.error('Error while updateFavoriteIngredients:', error);
      return res.json({
        success: false,
        alert: "error",
        message: `${error.message}`,
        error,
      });
    }
  }
  
  

  async updateDeliveryTime (req, res) {
    const { estimatedDate, estimatedTime, mealID } = req.body
   
    try {
      if (estimatedDate && estimatedTime && mealID) {
        // TODO validate data
        await Meal.updateOne({ _id: mealID }, { estimatedDate, estimatedTime })
        return res.status(200).json({
          success: true,
        });
      }
      return res.json({ success: false, message: 'Missing data' });
    } catch (error) {
      console.error('Error while updateDeliveryTime', error)
      return res.json({
        success: false,
        alert: "error",
        message: `${error.message}`,
        error,
      });
    }
  }

  async addReview (req, res) {
    const { rating, content, mealID, customerID } = req.body
    const customerIDNew = customerID || req.user._id;

    try {
      if (rating && content && mealID && customerIDNew) {
        // TODO validate data
        const meal = await Meal.findOne({ _id: mealID }).lean()
        if (meal) {
          await MealReviewModel.create({
            content,
            rating,
            mealID,
            customerID: customerIDNew ,
          })
          return res.json({
            success: true,
          });
        }
        return res.json({
          success: false,
          message: 'Meal not found'
        });
      }
      return res.json({ success: false, message: 'Missing data' });
    } catch (error) {
      console.error('Error while addReview', error)
      return res.json({
        success: false,
        alert: "error",
        message: `${error.message}`,
        error,
      });
    }
  }

  async cancelMeal (req, res) {
    const { mealID } = req.body

    try {
      if (mealID) {
        // TODO validate data
        await Meal.updateOne({ _id: mealID }, { status: 'cancelled' })
        
        return res.json({
          success: true,
        });
      }
      return res.json({ success: false, message: 'Missing data' });
    } catch (error) {
      console.error('Error while cancelMeal', error)
      return res.json({
        success: false,
        alert: "error",
        message: `${error.message}`,
        error,
      });
    }
  }
  
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const status = req.query.status || '';
      const skip = (page - 1) * pageSize;
      const { search } = req.query;


      let filter = {};

      if(status){
        filter.status = status
      }

      //Check for search 
      if (search) {
        const searchFields = ["name"];
        const cond = searchFields.map((field) => {
          return { [field]: { $regex: new RegExp(search, "i") } };
        });
        filter = { $or: cond };
      }



      // Check cache 
      const cacheKey = search ? null : "Meals";
      let meals;
      // if (cacheKey) {
      //   meals = await memoryCache.get(cacheKey);
      // }

      if (!meals) {
        meals = await Meal.find(filter)
          .select("-__v -createdAt -updatedAt")
          .populate({
            path: 'customerID',
            select: 'email info contact',
          })
          .sort({ estimatedDate: 1 }) // 1: tăng dần, -1: giảm dần
          .lean()
          .skip(skip)
          .limit(pageSize);

        
        if (cacheKey) {
          const ttl = 6 * 60 * 1000;
          await memoryCache.set(cacheKey, meals, ttl);
        }
      }

      const total = await Meal.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };
      console.log('KKK:',meals)

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
      const { id } = req.params; // `id` của meal
  
      // Tìm meal theo ID và chỉ lấy các trường cần thiết
      const meal = await Meal.findOne({ _id: id })
        .select("estimatedDate estimatedTime status orderID favoriteIngredients")
        .populate({
          path: "favoriteIngredients",
          populate: {
            path: "iTags", // Populate iTags trong favoriteIngredients
          },
        })
        .lean();
  
      if (!meal) throw "Meal không tồn tại";
  
      const { orderID } = meal; // Lấy orderID từ meal
  
      // Tìm OrderInfo dựa trên orderID
      const OrderInfo = await Order.findOne({ _id: orderID }).lean();
      if (!OrderInfo) throw "Đơn hàng không tồn tại";
  
      // Lấy danh sách orderTags từ OrderInfo
      const orderTags = OrderInfo.iTags;
  
      // Thêm orderTags vào đối tượng meal
      meal.orderTags = orderTags;
  
      // Trả về kết quả bao gồm meal với orderTags
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
      console.log(req.body)
      const data = req.body;
      const lang = req.headers.lang;

      const newMeal = new Meal(data);
      await newMeal.save();

      // Clear cache
      await memoryCache.del("Meals");

      res.status(200).send({
        success: true,
        message: translations.addSuccess[lang],
        data: newMeal,
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

      const updatedMeal = await Meal.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updatedMeal) {
        throw translations.mealNotExist[lang];
      }

      // Clear cache
      await memoryCache.del("Meals");

      res.status(200).send({
        success: true,
        message: translations.updateSuccess[lang],
        data: updatedMeal,
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

      const meal = await Meal.exists({ _id: id });

      if (!meal) {
        throw translations.mealNotExist[lang];
      }

      await Meal.findOneAndDelete({ _id: id });

      // Clear cache
      await memoryCache.del("Meals");

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
  async gets(req, res) {
    try {
      const { id } = req.params;

      const meals = await Meal.find({orderID: id}).sort({ estimatedDate: 1 })
        .lean()
        .sort({ createdAt: -1 })
        .select("-__v -createdAt -updatedAt ")

      res.status(200).json({
        success: true,
        data: { meals },
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



  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
 
    try {
        if (!id || !status) {
            return res.status(400).json({
                success: false,
                message: 'Missing mealID or status',
            });
        }

        // Kiểm tra xem status có hợp lệ không
        const validStatuses = ['pending', 'done', 'cancelled', 'inprogress'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value',
            });
        }

        // Cập nhật status cho món ăn
        const updatedMeal = await Meal.updateOne({ _id: id }, { status });
        
        if (updatedMeal.nModified === 0) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found or status is already the same',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Status updated successfully',
        });
    } catch (error) {
        console.error('Error while updateStatus', error);
        return res.status(500).json({
            success: false,
            alert: 'error',
            message: error.message,
            error,
        });
    }
}

}

export default MealService;
