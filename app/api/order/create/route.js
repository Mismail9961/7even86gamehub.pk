
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product"; // Make sure you have this
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { address, items } = await request.json();

    if (!address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Address and items are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find the selected address from user's addresses
    const selectedAddress = user.addresses.find(
      addr => addr._id.toString() === address
    );

    if (!selectedAddress) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.product} not found` },
          { status: 404 }
        );
      }

      // Use offerPrice if available, otherwise use regular price
      const itemPrice = product.offerPrice || product.price;
      totalAmount += itemPrice * item.quantity;
      
      orderItems.push({
        product: item.product,
        quantity: item.quantity
      });
    }

    // Add tax (2%)
    const tax = Math.floor(totalAmount * 0.02);
    const finalAmount = totalAmount + tax;

    // Create the order with your schema structure
    const newOrder = new Order({
      userId: user._id,
      address: {
        fullName: selectedAddress.fullName,
        phoneNumber: selectedAddress.phoneNumber,
        pinCode: selectedAddress.pincode, // Note: your form uses 'pincode' but schema uses 'pinCode'
        area: selectedAddress.area,
        city: selectedAddress.city,
        state: selectedAddress.state,
      },
      items: orderItems,
      amount: finalAmount,
      status: "Order Placed",
      paymentType: "COD", // Default payment type
    });

    await newOrder.save();

    // Clear the user's cart after successful order
    user.cartItems = {};
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
} 
