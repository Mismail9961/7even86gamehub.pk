// File: app/api/product/add/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product, { Category } from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Log session info for debugging
    console.log("Session user:", {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role,
    });

    if (!session.user?.role) {
      return NextResponse.json(
        { success: false, message: "User role not found in session" },
        { status: 403 }
      );
    }

    if (!["seller", "admin"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: `Not authorized. User role: ${session.user.role}` },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: "Product name is required" 
      }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: "Product description is required" 
      }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ 
        success: false, 
        message: "Category is required" 
      }, { status: 400 });
    }

    if (!price || Number(price) <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Valid price is required" 
      }, { status: 400 });
    }

    if (offerPrice && Number(offerPrice) > Number(price)) {
      return NextResponse.json({ 
        success: false, 
        message: "Offer price cannot be greater than original price" 
      }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "At least one product image is required" 
      }, { status: 400 });
    }

    await connectDB();

    // Verify category exists
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid category ID" 
      }, { status: 400 });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json({ 
        success: false, 
        message: "Category not found" 
      }, { status: 400 });
    }

    // Upload images to Cloudinary
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              resource_type: "auto",
              folder: "products" // Optional: organize in folders
            },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(buffer);
        });
      })
    );

    const imageUrls = uploadResults.map((r) => r.secure_url);

    const newProduct = await Product.create({
      userId: session.user.id,
      name: name.trim(),
      description: description.trim(),
      category: category,
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      image: imageUrls,
    });

    // Populate category name in response
    await newProduct.populate('category', 'name');

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Something went wrong" 
    }, { status: 500 });
  }
}