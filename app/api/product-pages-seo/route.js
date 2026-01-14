import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ProductPagesSeo from "@/models/ProductPagesSeo";

export async function GET() {
  try {
    await connectDB();
    let seoSettings = await ProductPagesSeo.findOne({ identifier: "product-pages-seo" }).lean();

    if (!seoSettings) {
      seoSettings = await ProductPagesSeo.create({
        identifier: "product-pages-seo",
        title: "Our Products | Gaming Hub",
        description: "Browse our collection of gaming products",
        keywords: ["gaming", "products", "online store"],
      });
      seoSettings = seoSettings.toObject();
    }

    return NextResponse.json({ success: true, data: seoSettings });
  } catch (error) {
    console.error("Error fetching SEO:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "seller")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const data = await request.json();
    const seoSettings = await ProductPagesSeo.findOneAndUpdate(
      { identifier: "product-pages-seo" },
      { ...data, updatedBy: session.user.id || session.user.email },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, data: seoSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}