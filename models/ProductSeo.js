// File: /models/ProductSeo.js
import mongoose from "mongoose";

const productOpenGraphSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    url: { type: String, default: "" },
    siteName: { type: String, default: "" },
    locale: { type: String, default: "en_US" },
    type: { type: String, default: "product" },
    image: { type: String, default: "" },
    price: { type: Number },
    currency: { type: String, default: "PKR" },
    availability: { type: String, default: "in stock" },
  },
  { _id: false }
);

const productSeoSchema = new mongoose.Schema(
  {
    productId: { 
      type: String, 
      required: true, 
      unique: true,
      ref: 'Product' 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: { type: [String], default: [] },
    canonicalUrl: { type: String, default: "" },
    openGraph: { type: productOpenGraphSchema, default: {} },
    
    // Additional SEO fields for products
    structuredData: {
      brand: { type: String, default: "" },
      sku: { type: String, default: "" },
      gtin: { type: String, default: "" },
      mpn: { type: String, default: "" },
      condition: { type: String, default: "new" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProductSeo || mongoose.model("ProductSeo", productSeoSchema);