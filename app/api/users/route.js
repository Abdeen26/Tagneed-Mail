// app/api/users/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Department from "@/lib/models/Department";

// GET - Fetch all users or single user by ID
export async function GET(req) {
  try {
    console.log("🔍 [GET /api/users] Starting request...");

    // Check database connection
    console.log("🔄 Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected successfully");

    // Check for query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const departmentId = searchParams.get("department");
    const role = searchParams.get("role");

    let query = {};

    // If specific user ID requested
    if (userId) {
      console.log(`🔍 Fetching user with ID: ${userId}`);

      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error(`❌ Invalid user ID format: ${userId}`);
        return NextResponse.json(
          { message: "Invalid user ID format." },
          { status: 400 }
        );
      }

      const user = await User.findById(userId)
        .select("-password")
        .populate({
          path: "department",
          model: Department,
          select: "name description",
        })
        .lean();

      if (!user) {
        console.error(`❌ User not found with ID: ${userId}`);
        return NextResponse.json(
          { message: "User not found." },
          { status: 404 }
        );
      }

      console.log(`✅ Found user: ${user.email}`);
      return NextResponse.json(user, { status: 200 });
    }

    // Apply filters if provided
    if (departmentId) {
      if (!/^[0-9a-fA-F]{24}$/.test(departmentId)) {
        console.error(`❌ Invalid department ID format: ${departmentId}`);
        return NextResponse.json(
          { message: "Invalid department ID format." },
          { status: 400 }
        );
      }
      query.department = departmentId;
      console.log(`🔍 Filtering by department: ${departmentId}`);
    }

    if (role) {
      query.role = role;
      console.log(`🔍 Filtering by role: ${role}`);
    }

    console.log("🔍 Fetching users from database...");

    // Fetch users with filters
    const users = await User.find(query)
      .select("-password")
      .populate({
        path: "department",
        model: Department,
        select: "name description",
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${users.length} users`);

    return NextResponse.json(
      {
        success: true,
        count: users.length,
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [GET /api/users] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(req) {
  try {
    console.log("🔍 [POST /api/users] Starting user creation...");

    await dbConnect();
    console.log("✅ Database connected");

    const body = await req.json();
    console.log("📦 Request body received");

    // Validate required fields
    const requiredFields = ["name", "email", "password"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(", ")}`);
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      console.error(`❌ Invalid email format: ${body.email}`);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      console.error(`❌ User already exists with email: ${body.email}`);
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Validate department if provided
    if (body.department) {
      if (!/^[0-9a-fA-F]{24}$/.test(body.department)) {
        console.error(`❌ Invalid department ID format: ${body.department}`);
        return NextResponse.json(
          {
            success: false,
            message: "Invalid department ID format.",
          },
          { status: 400 }
        );
      }

      const departmentExists = await Department.findById(body.department);
      if (!departmentExists) {
        console.error(`❌ Department not found: ${body.department}`);
        return NextResponse.json(
          {
            success: false,
            message: "Department not found.",
          },
          { status: 404 }
        );
      }
    }

    console.log("📝 Creating new user...");

    // Create new user
    const newUser = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role || "user",
      department: body.department || null,
      status: body.status || "active",
      ...(body.profile && { profile: body.profile }),
    });

    // Fetch created user without password
    const createdUser = await User.findById(newUser._id)
      .select("-password")
      .populate({
        path: "department",
        model: Department,
        select: "name description",
      })
      .lean();

    console.log(`✅ User created successfully: ${createdUser.email}`);

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully.",
        data: createdUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ [POST /api/users] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing user
export async function PUT(req) {
  try {
    console.log("🔍 [PUT /api/users] Starting user update...");

    await dbConnect();
    console.log("✅ Database connected");

    const body = await req.json();
    console.log("📦 Request body received");

    const { id, ...updateFields } = body;

    if (!id) {
      console.error("❌ Missing user ID");
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      console.error(`❌ Invalid user ID format: ${id}`);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID format.",
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      console.error(`❌ User not found with ID: ${id}`);
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // Filter out undefined values and handle special cases
    const filteredUpdates = {};
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] !== undefined && updateFields[key] !== null) {
        // Handle empty string for department (set to null)
        if (key === "department") {
          filteredUpdates[key] =
            updateFields[key] === "" ? null : updateFields[key];

          // Validate department if provided
          if (
            filteredUpdates[key] &&
            !/^[0-9a-fA-F]{24}$/.test(filteredUpdates[key])
          ) {
            console.error(
              `❌ Invalid department ID format: ${filteredUpdates[key]}`
            );
            throw new Error("Invalid department ID format.");
          }
        } else {
          filteredUpdates[key] = updateFields[key];
        }
      }
    });

    console.log("📝 Filtered updates to apply:", filteredUpdates);

    if (Object.keys(filteredUpdates).length === 0) {
      console.log("⚠️ No fields to update");
      return NextResponse.json(
        {
          success: false,
          message: "No fields to update.",
        },
        { status: 400 }
      );
    }

    // Check for email uniqueness if email is being updated
    if (filteredUpdates.email && filteredUpdates.email !== existingUser.email) {
      const emailExists = await User.findOne({
        email: filteredUpdates.email,
        _id: { $ne: id },
      });

      if (emailExists) {
        console.error(`❌ Email already in use: ${filteredUpdates.email}`);
        return NextResponse.json(
          {
            success: false,
            message: "Email already in use by another user.",
          },
          { status: 409 }
        );
      }
    }

    console.log(`🔍 Updating user with ID: ${id}`);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, filteredUpdates, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate({
        path: "department",
        model: Department,
        select: "name description",
      });

    console.log(`✅ User updated successfully: ${updatedUser.email}`);

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully.",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [PUT /api/users] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(req) {
  try {
    console.log("🔍 [DELETE /api/users] Starting user deletion...");

    await dbConnect();
    console.log("✅ Database connected");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      console.error("❌ Missing user ID in query parameters");
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required as query parameter.",
        },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      console.error(`❌ Invalid user ID format: ${id}`);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID format.",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking for user with ID: ${id}`);

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      console.error(`❌ User not found with ID: ${id}`);
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users (optional)
    if (existingUser.role === "admin") {
      console.error(`❌ Cannot delete admin user: ${id}`);
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete admin users.",
        },
        { status: 403 }
      );
    }

    console.log(`🗑️ Deleting user: ${existingUser.email}`);

    // Delete user
    await User.findByIdAndDelete(id);

    console.log(`✅ User deleted successfully: ${id}`);

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [DELETE /api/users] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (alternative to PUT)
export async function PATCH(req) {
  try {
    console.log("🔍 [PATCH /api/users] Starting partial update...");

    await dbConnect();
    console.log("✅ Database connected");

    const body = await req.json();
    console.log("📦 Request body received");

    const { id, ...updateFields } = body;

    if (!id) {
      console.error("❌ Missing user ID");
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      console.error(`❌ Invalid user ID format: ${id}`);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID format.",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking for user with ID: ${id}`);

    // Find and update user
    const updatedUser = await User.findById(id).select("-password").populate({
      path: "department",
      model: Department,
      select: "name description",
    });

    if (!updatedUser) {
      console.error(`❌ User not found with ID: ${id}`);
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // Apply updates
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] !== undefined) {
        if (key === "department") {
          updatedUser[key] =
            updateFields[key] === "" ? null : updateFields[key];
        } else {
          updatedUser[key] = updateFields[key];
        }
      }
    });

    await updatedUser.save();

    console.log(`✅ User partially updated: ${updatedUser.email}`);

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully.",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [PATCH /api/users] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
