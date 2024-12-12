import mongoose from "mongoose";

export const IngredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    code: {
      type: String,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    iTags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'ingredient-tag',
    },
    iGroupID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ingredient-group',
    },
  },
  { timestamps: true }
);

const Ingredient = mongoose.model("ingredient", IngredientSchema);

export default Ingredient;
