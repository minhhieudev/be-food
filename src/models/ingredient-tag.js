import mongoose from "mongoose";

const IngredientTagSchema = new mongoose.Schema(
  {
    iTagName : {
      type: String,
    },
    color : {
      type: String,
    },
  },
  { timestamps: true }
);

const IngredientTag = mongoose.model("ingredient-tag", IngredientTagSchema);

export default IngredientTag;
