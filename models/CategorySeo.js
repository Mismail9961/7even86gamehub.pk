import mongoose from "mongoose";

const openGraphSchema = new mongoose.Schema(
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

const categorySeoSchema = new mongoose.Schema(
  {
    // Reference to Category model (optional for backward compatibility with existing records)
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false, // Made optional for existing records
      unique: true,
      sparse: true, // Allows multiple null values
    },
    categorySlug: {
      type: String,
      required: true,
      unique: true, // This ALREADY creates the index.
      trim: true,
      // Removed enum - now dynamic based on categories from database
    },
    categoryName: {
      type: String,
      required: true,
    },
    seo: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      keywords: { type: [String], default: [] },
      openGraph: { type: openGraphSchema, default: () => ({}) },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// REMOVED: categorySeoSchema.index({ categorySlug: 1 }); 
// It was redundant because of 'unique: true' above.

export default mongoose.models.CategorySeo ||
  mongoose.model("CategorySeo", categorySeoSchema);