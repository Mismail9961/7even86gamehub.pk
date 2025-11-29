// app/api/admin/orders/update-payment/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

// Update payment type (admin only)
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is admin or seller
    if (!["admin", "seller"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin or Seller access required." },
        { status: 403 }
      );
    }

    const { orderId, paymentType } = await req.json();

    if (!orderId || !paymentType) {
      return NextResponse.json(
        { success: false, error: "Order ID and payment type are required" },
        { status: 400 }
      );
    }

    // Validate payment type
    const validPaymentTypes = ["COD", "Paid", "Pending", "Refunded"];
    if (!validPaymentTypes.includes(paymentType)) {
      return NextResponse.json(
        { success: false, error: `Invalid payment type. Must be one of: ${validPaymentTypes.join(", ")}` },
        { status: 400 }
      );
    }

    await connectDB();

    // Update the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentType },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment type updated successfully",
      order: order
    });
  } catch (err) {
    console.error("Error updating payment type:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update payment type" },
      { status: 500 }
    );
  }
}


