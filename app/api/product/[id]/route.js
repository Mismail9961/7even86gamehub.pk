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

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { name, description, price, offerPrice, image, category } = body;

    // Validate required fields
    if (!name || !description || !price) {
      return NextResponse.json(
        { success: false, error: "Name, description, and price are required" },
        { status: 400 }
      );
    }

    // Validate price
    if (price <= 0) {
      return NextResponse.json(
        { success: false, error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate offer price if provided
    if (offerPrice !== null && offerPrice !== undefined) {
      if (offerPrice < 0) {
        return NextResponse.json(
          { success: false, error: "Offer price cannot be negative" },
          { status: 400 }
        );
      }
      if (offerPrice >= price) {
        return NextResponse.json(
          { success: false, error: "Offer price must be less than regular price" },
          { status: 400 }
        );
      }
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description.trim(),
        price,
        offerPrice: offerPrice || null,
        image: image || existingProduct.image,
        category: category || existingProduct.category,
      },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, error: "Invalid product ID format" },
        { status: 400 }
      );
    }
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}