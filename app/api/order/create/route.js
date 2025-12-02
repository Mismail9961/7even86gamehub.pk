import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // or use 'smtp.gmail.com'
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your app password
  },
});

// Function to send email to admin
async function sendAdminNotification(order, user, orderItems) {
  try {
    const itemsHTML = orderItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Rs ${item.price}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Rs ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .section-title { color: #667eea; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; color: #555; }
          .info-value { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #667eea; color: white; padding: 12px; text-align: left; }
          .total-row { background: #f0f0f0; font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
          .badge { display: inline-block; padding: 5px 15px; background: #4CAF50; color: white; border-radius: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 New Order Received!</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Order #${order._id}</p>
          </div>
          
          <div class="content">
            <!-- Order Status -->
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="badge">${order.status}</span>
            </div>

            <!-- Customer Information -->
            <div class="section">
              <div class="section-title">👤 Customer Information</div>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${user.name || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${user.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${order.address.phoneNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">User ID:</span>
                <span class="info-value">${user._id}</span>
              </div>
            </div>

            <!-- Delivery Address -->
            <div class="section">
              <div class="section-title">📍 Delivery Address</div>
              <div class="info-row">
                <span class="info-label">Full Name:</span>
                <span class="info-value">${order.address.fullName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Area:</span>
                <span class="info-value">${order.address.area}</span>
              </div>
              <div class="info-row">
                <span class="info-label">City:</span>
                <span class="info-value">${order.address.city}</span>
              </div>
              <div class="info-row">
                <span class="info-label">State:</span>
                <span class="info-value">${order.address.state}</span>
              </div>
              <div class="info-row">
                <span class="info-label">PIN Code:</span>
                <span class="info-value">${order.address.pinCode}</span>
              </div>
            </div>

            <!-- Order Details -->
            <div class="section">
              <div class="section-title">📦 Order Details</div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </div>

            <!-- Order Summary -->
            <div class="section">
              <div class="section-title">💰 Order Summary</div>
              <div class="info-row">
                <span class="info-label">Subtotal:</span>
                <span class="info-value">Rs ${(order.amount - Math.floor(order.amount * 0.02 / 1.02)).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tax (2%):</span>
                <span class="info-value">Rs ${Math.floor(order.amount * 0.02 / 1.02).toFixed(2)}</span>
              </div>
              <div class="info-row" style="border-bottom: none; font-size: 18px; color: #667eea; font-weight: bold; margin-top: 10px;">
                <span class="info-label">Total Amount:</span>
                <span class="info-value">Rs ${order.amount.toFixed(2)}</span>
              </div>
              <div class="info-row" style="border-bottom: none;">
                <span class="info-label">Payment Type:</span>
                <span class="info-value">${order.paymentType}</span>
              </div>
            </div>

            <!-- Order Metadata -->
            <div class="section">
              <div class="section-title">ℹ️ Additional Information</div>
              <div class="info-row">
                <span class="info-label">Order ID:</span>
                <span class="info-value">${order._id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${new Date().toLocaleString()}</span>
              </div>
              <div class="info-row" style="border-bottom: none;">
                <span class="info-label">Status:</span>
                <span class="info-value">${order.status}</span>
              </div>
            </div>

            <div class="footer">
              <p>This is an automated notification from your e-commerce system.</p>
              <p>Please log in to your admin panel to process this order.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Your Store" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Admin email
      subject: `🛒 New Order #${order._id} - ${order.address.fullName}`,
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Admin notification email sent successfully");
  } catch (error) {
    console.error("❌ Error sending admin email:", error);
    // Don't throw error - we don't want email failure to stop order creation
  }
}

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
      (addr) => addr._id.toString() === address
    );

    if (!selectedAddress) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    // Calculate total amount and prepare order items with product details
    let totalAmount = 0;
    const orderItems = [];
    const orderItemsForEmail = []; // For email notification

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
        quantity: item.quantity,
      });

      // Store product details for email
      orderItemsForEmail.push({
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
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
        pinCode: selectedAddress.pincode,
        area: selectedAddress.area,
        city: selectedAddress.city,
        state: selectedAddress.state,
      },
      items: orderItems,
      amount: finalAmount,
      status: "Order Placed",
      paymentType: "COD",
    });

    await newOrder.save();

    // Clear the user's cart after successful order
    user.cartItems = {};
    await user.save();

    // Send email notification to admin (don't await - run in background)
    sendAdminNotification(newOrder, user, orderItemsForEmail);

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