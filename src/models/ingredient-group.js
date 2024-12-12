import mongoose from "mongoose";

const IngredientGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  { timestamps: true }
);

const IngredientGroup = mongoose.model("ingredient-group", IngredientGroupSchema);

export default IngredientGroup;
