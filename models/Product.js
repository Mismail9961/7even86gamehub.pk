import mongoose from "mongoose";

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    createdBy: { type: String, required: true, ref: "user" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: "user" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, default: null },
    image: { type: [String], required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

// Export both models
const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export { Category };
export default Product;