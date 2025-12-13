// File: app/api/product/list/route.js
import connectDB from "@/lib/db";
import Product, { Category } from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    // Get all products
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    
    // Get all categories
    const categories = await Category.find({}).lean();
    
    // Create a category map for quick lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.name;
    });
    
    // Manually attach category names to products
    const productsWithCategories = products.map(product => {
      const categoryId = product.category?.toString() || product.category;
      return {
        ...product,
        category: {
          _id: categoryId,
          name: categoryMap[categoryId] || 'Uncategorized'
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: productsWithCategories,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}