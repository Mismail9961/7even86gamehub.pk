// app/api/admin/users/update-role/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Update Role API - Session:", session?.user);

    // Check if user is authenticated and is an admin (only admins can change roles)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access. Only admins can change user roles." },
        { status: 403 }
      );
    }

    const { userId, role } = await request.json();

    // Validate input
    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["customer", "seller", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Prevent admin from changing their own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    await connectDB();

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log(`Updated user ${userId} role to ${role}`);

    return NextResponse.json(
      { 
        message: "User role updated successfully",
        user: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role", details: error.message },
      { status: 500 }
    );
  }
}