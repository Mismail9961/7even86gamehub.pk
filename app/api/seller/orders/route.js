// app/api/seller/orders/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

// Get orders for seller (orders containing their products)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is seller or admin
    if (!["seller", "admin"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Seller access required." },
        { status: 403 }
      );
    }

    await connectDB();

    // Fetch all orders, newest first
    const allOrders = await Order.find({})
      .sort({ date: -1 })
      .lean();

    // Filter orders to only include those with products from this seller
    const sellerOrders = [];
    
    for (const order of allOrders) {
      // Get product details for each item
      const itemsWithProducts = await Promise.all(
        order.items.map(async (item) => {
          try {
            const product = await Product.findById(item.product);
            return {
              ...item,
              product: product || null
            };
          } catch (error) {
            console.error(`Error fetching product ${item.product}:`, error);
            return {
              ...item,
              product: null
            };
          }
        })
      );

      // Filter items to only include products from this seller
      const sellerItems = itemsWithProducts.filter(item => 
        item.product && item.product.userId === session.user.id
      );

      // Only include this order if it has at least one product from this seller
      if (sellerItems.length > 0) {
        // Get customer details
        const customer = await User.findById(order.userId).select("name email imageUrl");
        
        // Calculate the amount for seller's products only
        let sellerAmount = 0;
        sellerItems.forEach(item => {
          const price = item.product.offerPrice || item.product.price || 0;
          sellerAmount += price * item.quantity;
        });

        sellerOrders.push({
          ...order,
          customer: customer || { name: "Customer not found", email: "N/A", _id: order.userId },
          items: sellerItems, // Only seller's products
          sellerAmount: sellerAmount, // Amount for seller's products only
          totalItems: sellerItems.length
        });
      }
    }

    return NextResponse.json({ success: true, orders: sellerOrders });
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

