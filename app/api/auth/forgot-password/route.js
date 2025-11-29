import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Gmail SMTP Transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured!");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // prevent Google-auth user from changing password
    if (user.provider === "google" && !user.password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account uses Google sign-in. Please use 'Sign in with Google' instead.",
        },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = createTransporter();

    // Development fallback if email is not configured
    if (!transporter) {
      console.log("\n🔐 PASSWORD RESET URL (DEV MODE)");
      console.log(
        `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
      );

      return NextResponse.json({
        success: true,
        message: "Email disabled. Check server logs for reset link.",
        devMode: true,
      });
    }

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name || ""},</p>
          <p>You requested to reset your password. Click the button below:</p>
          <a 
            href="${resetUrl}" 
            style="padding: 12px 25px; background: #f97316; color: white; border-radius: 6px; text-decoration: none;"
          >
            Reset Password
          </a>
          <p>Or open this link:</p>
          <p style="color:#f97316; word-break: break-all;">${resetUrl}</p>
          <p>This link expires in <b>1 hour</b>.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reset email." },
      { status: 500 }
    );
  }
}
