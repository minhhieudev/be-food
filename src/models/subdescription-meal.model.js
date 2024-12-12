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
  },
  { timestamps: true } 
);

const SubscriptionMeal = mongoose.model("subdescription-meal", SubscriptionMealSchema);

export default SubscriptionMeal;
