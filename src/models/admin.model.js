import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: "active" },
    lastAccessed: { type: Date, default: Date.now() },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

AdminSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("admin", AdminSchema);

export default Admin;
