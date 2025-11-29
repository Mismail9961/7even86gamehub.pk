// app/api/admin/orders/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

// Get all orders (admin only)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await connectDB();

    // Fetch all orders with user details, newest first
    const orders = await Order.find({})
      .sort({ date: -1 })
      .lean();

    // Populate user and product details
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Get user details
        const user = await User.findById(order.userId).select("name email imageUrl role");
        
        // Get product details for each item
        const itemsWithProducts = await Promise.all(
          order.items.map(async (item) => {
            try {
              const product = await Product.findById(item.product);
              return {
                ...item,
                product: product || { name: "Product not found", _id: item.product }
              };
            } catch (error) {
              console.error(`Error fetching product ${item.product}:`, error);
              return {
                ...item,
                product: { name: "Product not found", _id: item.product }
              };
            }
          })
        );

        return {
          ...order,
          user: user || { name: "User not found", email: "N/A", _id: order.userId },
          items: itemsWithProducts
        };
      })
    );

    return NextResponse.json({ success: true, orders: ordersWithDetails });
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

