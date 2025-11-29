// models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true // Add index for faster queries
  },
  address: {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    pinCode: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product",
      required: true
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1
    }
  }],
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  status: { 
    type: String, 
    default: "Order Placed",
    enum: ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"]
  },
  paymentType: {
    type: String,
    default: "COD",
    enum: ["COD", "Paid", "Pending", "Refunded"]
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Add compound index for better query performance
OrderSchema.index({ userId: 1, date: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;