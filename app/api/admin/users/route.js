import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Admin Users API - Session:", session?.user);

    // Check if user is authenticated and is an admin or seller
    if (!session || !["admin", "seller"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    await connectDB();

    // Fetch all users, excluding password field
    const users = await User.find({})
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Fetched ${users.length} users`);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: error.message },
      { status: 500 }
    );
  }
}