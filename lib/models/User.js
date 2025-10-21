import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name."],
  },
  email: {
    type: String,
    required: [true, "Please provide your email."],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Please provide a valid email.",
    ],
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
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
