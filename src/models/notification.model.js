import mongoose from "mongoose";

export const NotificationSchema = new mongoose.Schema(
  {
    scriptCode: {
      type: String,
    },
    content: {
      type: String,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("notification", NotificationSchema);

export default Notification;
