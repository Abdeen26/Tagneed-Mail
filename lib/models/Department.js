// lib/models/Department.js - UPDATED
import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a department name."],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Department ||
  mongoose.model("Department", DepartmentSchema);
