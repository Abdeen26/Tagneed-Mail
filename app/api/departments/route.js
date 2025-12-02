// app/api/departments/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Department from "@/lib/models/Department";
import User from "@/lib/models/User"; // Import User model to check assignments
import mongoose from "mongoose";

// Helper function for error responses
const errorResponse = (message, status = 500, error = null) => {
  console.error(`❌ [${status}] ${message}:`, error);
  return NextResponse.json(
    {
      message,
      ...(error && { error: error.message }),
    },
    { status }
  );
};

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET: Fetch all departments
export async function GET() {
  try {
    console.log("🔍 [GET /api/departments] Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected");

    // Fetch departments with user count
    const departments = await Department.aggregate([
      {
        $lookup: {
          from: "users", // MongoDB collection name for User model
          localField: "_id",
          foreignField: "department",
          as: "users",
        },
      },
      {
        $addFields: {
          userCount: { $size: "$users" },
        },
      },
      {
        $project: {
          users: 0, // Remove the users array from response
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    console.log(`✅ Found ${departments.length} departments`);
    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    return errorResponse("Failed to fetch departments", 500, error);
  }
}

// GET Single Department
export async function GET_SINGLE(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id || !isValidObjectId(id)) {
      return errorResponse("Valid department ID is required", 400);
    }

    const department = await Department.findById(id).lean();

    if (!department) {
      return errorResponse("Department not found", 404);
    }

    // Get user count for this department
    const userCount = await User.countDocuments({ department: id });

    return NextResponse.json({ ...department, userCount }, { status: 200 });
  } catch (error) {
    return errorResponse("Failed to fetch department", 500, error);
  }
}

// POST: Create a new department
export async function POST(req) {
  try {
    console.log("🔍 [POST /api/departments] Creating new department...");
    await dbConnect();

    const body = await req.json();
    console.log("📦 Request body:", body);

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return errorResponse("Department name is required", 400);
    }

    const name = body.name.trim();
    const description = body.description?.trim() || "";

    // Check for duplicate department name
    const existingDepartment = await Department.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive
    });

    if (existingDepartment) {
      return errorResponse("Department with this name already exists", 409);
    }

    // Create new department
    const department = await Department.create({
      name,
      description,
    });

    console.log(
      `✅ Department created: ${department._id} - ${department.name}`
    );
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return errorResponse("Department with this name already exists", 409);
    }

    return errorResponse("Failed to create department", 500, error);
  }
}

// PUT: Update a department
export async function PUT(req) {
  try {
    console.log("🔍 [PUT /api/departments] Updating department...");
    await dbConnect();

    const body = await req.json();
    console.log("📦 Request body:", body);

    const { id, ...updateFields } = body;

    // Validate required fields
    if (!id || !isValidObjectId(id)) {
      return errorResponse("Valid department ID is required", 400);
    }

    // Check if department exists
    const existingDepartment = await Department.findById(id);
    if (!existingDepartment) {
      return errorResponse("Department not found", 404);
    }

    // Filter and sanitize update fields
    const filteredUpdates = {};
    if (updateFields.name !== undefined) {
      filteredUpdates.name = updateFields.name.trim();

      // Check for duplicate name (excluding current department)
      const duplicateDepartment = await Department.findOne({
        name: { $regex: new RegExp(`^${filteredUpdates.name}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicateDepartment) {
        return errorResponse(
          "Another department with this name already exists",
          409
        );
      }
    }

    if (updateFields.description !== undefined) {
      filteredUpdates.description = updateFields.description.trim();
    }

    // If no fields to update
    if (Object.keys(filteredUpdates).length === 0) {
      return errorResponse("No fields to update", 400);
    }

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      filteredUpdates,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log(`✅ Department updated: ${updatedDepartment._id}`);
    return NextResponse.json(updatedDepartment, { status: 200 });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return errorResponse("Department with this name already exists", 409);
    }

    return errorResponse("Failed to update department", 500, error);
  }
}

// DELETE: Delete a department (with user assignment check)
export async function DELETE(req) {
  try {
    console.log("🔍 [DELETE /api/departments] Deleting department...");
    await dbConnect();

    // Get ID from query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    console.log("🗑️ Request to delete department ID:", id);

    // Validate required fields
    if (!id || !isValidObjectId(id)) {
      return errorResponse("Valid department ID is required", 400);
    }

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return errorResponse("Department not found", 404);
    }

    // Check if any users are assigned to this department
    const userCount = await User.countDocuments({ department: id });
    console.log(`📊 Users assigned to department ${id}: ${userCount}`);

    if (userCount > 0) {
      // Get sample users for the error message
      const sampleUsers = await User.find({ department: id })
        .select("name username")
        .limit(5)
        .lean();

      return NextResponse.json(
        {
          message: "Cannot delete department with assigned users",
          userCount,
          assignedUsers: sampleUsers,
          suggestion:
            "Please reassign or remove users from this department before deletion.",
        },
        { status: 400 }
      );
    }

    // Delete department
    const deletedDepartment = await Department.findByIdAndDelete(id);

    console.log(
      `✅ Department deleted: ${deletedDepartment._id} - ${deletedDepartment.name}`
    );

    return NextResponse.json(
      {
        message: "Department deleted successfully",
        department: deletedDepartment,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse("Failed to delete department", 500, error);
  }
}

// PATCH: Bulk operations or specific updates
export async function PATCH(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action, ids, ...updateFields } = body;

    if (action === "bulkUpdate" && Array.isArray(ids)) {
      // Validate all IDs
      const validIds = ids.filter((id) => isValidObjectId(id));

      if (validIds.length === 0) {
        return errorResponse("No valid department IDs provided", 400);
      }

      // Perform bulk update
      const result = await Department.updateMany(
        { _id: { $in: validIds } },
        updateFields,
        { runValidators: true }
      );

      return NextResponse.json(
        {
          message: `Updated ${result.modifiedCount} departments`,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        },
        { status: 200 }
      );
    }

    if (action === "bulkDelete" && Array.isArray(ids)) {
      // Validate all IDs
      const validIds = ids.filter((id) => isValidObjectId(id));

      if (validIds.length === 0) {
        return errorResponse("No valid department IDs provided", 400);
      }

      // Check for departments with assigned users
      const departmentsWithUsers = await User.aggregate([
        {
          $match: {
            department: { $in: validIds },
          },
        },
        {
          $group: {
            _id: "$department",
            userCount: { $sum: 1 },
          },
        },
      ]);

      if (departmentsWithUsers.length > 0) {
        const problematicDepts = departmentsWithUsers.map((dept) => ({
          departmentId: dept._id,
          userCount: dept.userCount,
        }));

        return NextResponse.json(
          {
            message: "Some departments have assigned users",
            departmentsWithUsers: problematicDepts,
            suggestion: "Remove or reassign users before deletion",
          },
          { status: 400 }
        );
      }

      // Delete departments
      const result = await Department.deleteMany({ _id: { $in: validIds } });

      return NextResponse.json(
        {
          message: `Deleted ${result.deletedCount} departments`,
          deletedCount: result.deletedCount,
        },
        { status: 200 }
      );
    }

    return errorResponse("Invalid action or missing parameters", 400);
  } catch (error) {
    return errorResponse("Failed to perform bulk operation", 500, error);
  }
}
