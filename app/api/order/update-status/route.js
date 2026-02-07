// app/api/order/update-status/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function PUT(request) {
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
          message: "Forbidden - Only admins and sellers can update orders" 
        },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { orderId, status, paymentType } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!status && !paymentType) {
      return NextResponse.json(
        { success: false, message: "At least one field (status or paymentType) is required to update" },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
        },
        { status: 400 }
      );
    }

    // Validate paymentType if provided
    const validPaymentTypes = ["COD", "Paid", "Pending", "Refunded"];
    if (paymentType && !validPaymentTypes.includes(paymentType)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid payment type. Must be one of: ${validPaymentTypes.join(", ")}` 
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the order first to verify it exists
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentType) updateData.paymentType = paymentType;

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`✅ Order ${orderId} updated by ${userRole}: ${session.user.email}`);
    console.log(`   - Status: ${status || 'unchanged'}`);
    console.log(`   - Payment Type: ${paymentType || 'unchanged'}`);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
      updates: {
        status: status || order.status,
        paymentType: paymentType || order.paymentType
      }
    });

  } catch (error) {
    console.error("❌ Error updating order:", error);
    
    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid Order ID format" },
        { status: 400 }
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to update order" 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}