// File: app/api/product/add/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product, { Category } from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allow long uploads (e.g. 4 x 7MB images)
export const maxDuration = 60;

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const COMPRESS_QUALITY = 85;

/** Resize and compress image for faster upload and smaller storage */
async function processImage(buffer) {
  return sharp(buffer)
    .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: COMPRESS_QUALITY })
    .toBuffer();
}

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

    const contentType = req.headers.get("content-type") || "";
    let name, description, category, price, offerPrice, imageUrlsFromClient;
    let validFiles = [];

    if (contentType.includes("application/json")) {
      const body = await req.json();
      name = body.name;
      description = body.description;
      category = body.category;
      price = body.price;
      offerPrice = body.offerPrice;
      imageUrlsFromClient = Array.isArray(body.image) ? body.image : Array.isArray(body.imageUrls) ? body.imageUrls : [];
    } else {
      const formData = await req.formData();
      name = formData.get("name");
      description = formData.get("description");
      category = formData.get("category");
      price = formData.get("price");
      offerPrice = formData.get("offerPrice");
      const files = formData.getAll("images");
      validFiles = Array.isArray(files) ? files.filter((f) => f && f.size > 0) : [];
    }

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

    const hasPreUploadedUrls = imageUrlsFromClient != null && imageUrlsFromClient.length > 0;
    if (!hasPreUploadedUrls && validFiles.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "At least one product image is required" 
      }, { status: 400 });
    }

    for (const file of validFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({
          success: false,
          message: `Image "${file.name || "file"}" is too large. Maximum ${MAX_FILE_SIZE_MB}MB per image. Use smaller images or fewer images.`,
        }, { status: 400 });
      }
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

    let imageUrls;
    if (hasPreUploadedUrls) {
      imageUrls = imageUrlsFromClient.filter((u) => typeof u === "string" && u.length > 0);
      if (imageUrls.length === 0) {
        return NextResponse.json({ success: false, message: "At least one valid image URL is required" }, { status: 400 });
      }
    } else {
      const uploadResults = await Promise.all(
        validFiles.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          const processed = await processImage(buffer);
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "image", folder: "products" },
              (err, result) => (err ? reject(err) : resolve(result))
            );
            stream.end(processed);
          });
        })
      );
      imageUrls = uploadResults.map((r) => r.secure_url);
    }

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