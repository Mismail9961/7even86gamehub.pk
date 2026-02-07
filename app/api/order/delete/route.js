// app/api/order/delete/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function DELETE(request) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Check if user has admin or seller role
    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "seller") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Forbidden - Only admins and sellers can delete orders" 
        },
        { status: 403 }
      );
    }

    // Get the order ID from the request body or search params
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    // Alternative: Get from request body
    let orderIdFromBody;
    try {
      const body = await request.json();
      orderIdFromBody = body.orderId;
    } catch {
      // If parsing fails, that's okay - we'll use searchParams
    }

    const finalOrderId = orderId || orderIdFromBody;

    if (!finalOrderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the order first to verify it exists
    const order = await Order.findById(finalOrderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Delete the order
    await Order.findByIdAndDelete(finalOrderId);

    console.log(`✅ Order ${finalOrderId} deleted by ${userRole}: ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      deletedOrderId: finalOrderId,
    });

  } catch (error) {
    console.error("❌ Error deleting order:", error);
    
    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid Order ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to delete order" 
      },
      { status: 500 }
    );
  }
}