// File: app/api/product/[id]/route.js
import connectDB from "@/lib/db";
import Product, { Category } from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Manually fetch the category
    const categoryId = product.category?.toString() || product.category;
    const category = await Category.findById(categoryId).lean();

    // Attach category to product
    const productWithCategory = {
      ...product,
      category: category ? {
        _id: category._id,
        name: category.name
      } : {
        _id: categoryId,
        name: 'Uncategorized'
      }
    };

    return NextResponse.json({
      success: true,
      data: productWithCategory,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, error: "Invalid product ID format" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}