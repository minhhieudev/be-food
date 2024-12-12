import mongoose from "mongoose";
import { Schema } from "mongoose";
export const SettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
    },
  }
);

const Setting = mongoose.model("setting", SettingSchema);

export default Setting;
