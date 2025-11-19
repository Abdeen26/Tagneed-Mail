import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name."],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Please provide your username."],
      unique: true,
      max: [20, "Username cannot exceed 20 characters."],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
      minlength: 6,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Department",
    },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
