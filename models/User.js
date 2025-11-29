import mongoose from "mongoose";
const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true }, 
  landmark: { type: String },
  isDefault: { type: Boolean, default: false },
}, { _id: true }); // Ensure subdocuments get IDs
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    
    name: { type: String, required: true },
    
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    
    imageUrl: { type: String, default: "" },
    
    // Credentials login
    password: { type: String },
    
    // Google login
    googleId: { type: String, sparse: true, unique: true },
    provider: {
      type: String,
      enum: ["google", "credentials"],
      default: "credentials",
    },
    
    // Role
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    
    // Cart
    cartItems: { type: Object, default: {} },
    
    // Addresses
    addresses: [addressSchema],
    
    // Email verification
    emailVerified: { type: Boolean, default: false },
    
    // Forgot Password fields
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { 
    minimize: false,
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
