// File: models/ProductPagesSeo.js
import mongoose from "mongoose";

const productPagesOpenGraphSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    url: { type: String, default: "" },
    siteName: { type: String, default: "" },
    locale: { type: String, default: "en_US" },
    type: { type: String, default: "website" },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const productPagesSeoSchema = new mongoose.Schema(
  {
    identifier: { 
      type: String, 
      default: "product-pages-seo",
      unique: true,
      required: true 
    },
    title: { 
      type: String, 
      required: true,
      default: "Our Products | Gaming Hub"
    },
    description: { 
      type: String, 
      required: true,
      default: "Browse our collection of gaming products"
    },
    keywords: { 
      type: [String], 
      default: ["gaming", "products", "online store"] 
    },
    canonicalUrl: { 
      type: String, 
      default: "" 
    },
    openGraph: { 
      type: productPagesOpenGraphSchema, 
      default: () => ({}) 
    },
    structuredData: {
      organizationName: { type: String, default: "" },
      websiteName: { type: String, default: "" },
      defaultBrand: { type: String, default: "" },
      defaultCondition: { 
        type: String, 
        default: "new",
        enum: ["new", "refurbished", "used"]
      },
      defaultAvailability: { 
        type: String, 
        default: "in stock",
        enum: ["in stock", "out of stock", "preorder"]
      },
      defaultCurrency: { type: String, default: "PKR" },
      reviewCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 4.5, min: 0, max: 5 },
    },
    socialMedia: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },
    updatedBy: {
      type: String,
      default: ""
    }
  },
  { 
    timestamps: true,
    minimize: false
  }
);

// Prevent model recompilation
let ProductPagesSeo;
try {
  ProductPagesSeo = mongoose.models.ProductPagesSeo || 
    mongoose.model("ProductPagesSeo", productPagesSeoSchema);
} catch (error) {
  ProductPagesSeo = mongoose.model("ProductPagesSeo");
}

export default ProductPagesSeo;