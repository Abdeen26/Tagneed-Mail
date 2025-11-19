import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function GET() {
  await dbConnect();

  try {
    const users = await User.find()
      .select("-password")
      .populate("department", "name")
      .lean();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch users." },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  await dbConnect();

  try {
    const { id, name, department } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, department: department || null },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("department", "name");

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update user." },
      { status: 500 }
    );
  }
}
