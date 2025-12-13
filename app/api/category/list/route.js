// File: app/api/category/list/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Category } from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select("name");

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}