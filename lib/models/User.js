import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name."],
    },
    username: {
      type: String,
      required: [true, "Please provide your username."],
      unique: true,
      max: [20, "Username cannot exceed 20 characters."],
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
      minlength: 6,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
