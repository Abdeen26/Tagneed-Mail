import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a department name."],
    unique: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export default mongoose.models.Department ||
  mongoose.model("Department", DepartmentSchema);
