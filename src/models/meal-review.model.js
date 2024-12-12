import mongoose from "mongoose";

const MealReviewSchema = new mongoose.Schema(
  {
    content: {
      type: String, 
      required: true, 
    },
    rating: {
      type: Number, 
      required: true, 
    },
    customerID: {
      type: String, 
      required: true, 
    },
    mealID: {
      type: String, 
      required: true, 
    },
  },
  { timestamps: true } 
);

const MealReview = mongoose.model("meal-review", MealReviewSchema);

export default MealReview;
