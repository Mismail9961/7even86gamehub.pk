// File: /api/cart/remove-deleted-product/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/config/db";
import userModel from "@/lib/models/userModel";

export async function POST(request) {
  try {
    await connectDB();
    
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Remove the product from all users' carts
    const result = await userModel.updateMany(
      { "cartData.productId": productId },
      { 
        $pull: { 
          cartData: { productId: productId } 
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: "Product removed from all carts",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error removing product from carts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update carts" },
      { status: 500 }
    );
  }
}