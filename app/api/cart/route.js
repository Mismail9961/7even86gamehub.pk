// File: app/api/cart/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// Helper function to sync cart items with latest product data
async function syncCartWithProducts(cartItems) {
  const productIds = Object.keys(cartItems);
  const syncedCart = {};
  const updates = {
    deletedItems: [],
    updatedItems: [],
    totalDeleted: 0,
    totalUpdated: 0
  };

  for (const productId of productIds) {
    try {
      const product = await Product.findById(productId)
        .populate('category', 'name')
        .lean();

      if (!product) {
        // Product no longer exists - remove from cart
        updates.deletedItems.push(productId);
        updates.totalDeleted++;
        continue;
      }

      // Keep the item in cart with current quantity
      syncedCart[productId] = cartItems[productId];

      // Track if product was updated (you can enhance this logic)
      updates.totalUpdated++;

    } catch (error) {
      console.error(`Error syncing product ${productId}:`, error);
      // Keep item in cart if there's an error
      syncedCart[productId] = cartItems[productId];
    }
  }

  return { syncedCart, updates };
}

// Get user's cart with product sync
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cartItems = user.cartItems || {};

    // If cart is empty, return early
    if (Object.keys(cartItems).length === 0) {
      return NextResponse.json({
        success: true,
        data: {},
        products: [],
        totalItems: 0,
        totalAmount: 0,
        updates: { deletedItems: [], totalDeleted: 0, totalUpdated: 0 }
      });
    }

    // Sync cart with current product data
    const { syncedCart, updates } = await syncCartWithProducts(cartItems);

    // Update user's cart if items were deleted
    if (updates.totalDeleted > 0) {
      user.cartItems = syncedCart;
      await user.save();
    }

    // Fetch full product details for cart items
    const productIds = Object.keys(syncedCart);
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category', 'name')
      .lean();

    // Calculate totals
    let totalAmount = 0;
    let totalItems = 0;

    const cartWithProducts = products.map(product => {
      const quantity = syncedCart[product._id];
      const price = product.offerPrice || product.price;
      totalAmount += price * quantity;
      totalItems += quantity;

      return {
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        offerPrice: product.offerPrice,
        image: product.image,
        category: product.category?.name || 'Uncategorized',
        quantity: quantity
      };
    });

    return NextResponse.json({
      success: true,
      data: syncedCart,
      products: cartWithProducts,
      totalItems,
      totalAmount: Math.floor(totalAmount * 100) / 100,
      updates
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// Update user's cart
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItems } = await req.json();

    if (!cartItems || typeof cartItems !== "object") {
      return NextResponse.json(
        { error: "Invalid cart data" },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate all products exist before saving
    const productIds = Object.keys(cartItems);
    if (productIds.length > 0) {
      const validProducts = await Product.find({ 
        _id: { $in: productIds } 
      }).select('_id');
      
      const validProductIds = new Set(validProducts.map(p => p._id.toString()));
      
      // Filter out invalid products
      const validCartItems = {};
      for (const [productId, quantity] of Object.entries(cartItems)) {
        if (validProductIds.has(productId) && quantity > 0) {
          validCartItems[productId] = quantity;
        }
      }

      const user = await User.findByIdAndUpdate(
        session.user.id,
        { cartItems: validCartItems },
        { new: true }
      );

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Cart updated successfully",
        data: user.cartItems,
      });
    }

    // Empty cart
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { cartItems: {} },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      data: user.cartItems,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    );
  }
}