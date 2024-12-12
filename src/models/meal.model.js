import mongoose from "mongoose";

const MealSchema = new mongoose.Schema(
  {
    orderID: {
      type: String,
      //required: true, 
    },
    customerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'customer',
    },
    estimatedDate: {
      type: Date,
      //required: true, 
    },
    estimatedTime: {
      type: String,
      //required: true,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'done', 'cancelled', 'inprogress'], 
      default: 'pending', 
      required: true, 
    },
    favoriteIngredients: {
      type: [mongoose.Schema.Types.ObjectId], // Mảng chứa các ID thành phần ưa thích
      ref: 'ingredient',
    },
  },
  { timestamps: true }
);

const Meal = mongoose.model("Meal", MealSchema);

export default Meal;
