import mongoose from "mongoose";

const SubscriptionMealSchema = new mongoose.Schema(
  {
    name: {
      type: String, 
      required: true, 
    },
    totalDate: {
      type: Number, 
      required: true, 
    },
    mealsPerDay: {
      type: Number, 
      required: true, 
    },
    totalSub: {
      type: Number, 
      required: true, 
    },
    nutritionInfo: {
      calories: { type: String },
      protein: { type: String },
      carbs: { type: String },
      fats: { type: String }
    },
  },
  { timestamps: true } 
);

const SubscriptionMeal = mongoose.model("subdescription-meal", SubscriptionMealSchema);

export default SubscriptionMeal;
