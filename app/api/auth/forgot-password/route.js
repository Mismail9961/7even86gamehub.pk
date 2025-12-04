import User from "@/models/User";
import connectDB from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    // Validate email
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email required" }), 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }), 
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Security: Don't reveal if user exists or not
    if (!user) {
      // Still return success to prevent email enumeration
      return new Response(
        JSON.stringify({ message: "If an account exists, a reset email has been sent" }), 
        { status: 200 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // Use true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Email template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background-color: #4CAF50; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You recently requested to reset your password for your Quick Cart account. Click the button below to reset it:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4CAF50;">${resetLink}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br>Quick Cart Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Quick Cart Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request - Quick Cart",
      html: emailHTML,
      text: `You requested a password reset. Click here to reset your password: ${resetLink}. This link expires in 1 hour.`,
    });

    return new Response(
      JSON.stringify({ 
        message: "If an account exists, a reset email has been sent" 
      }), 
      { status: 200 }
    );

  } catch (err) {
    console.error("Forgot password error:", err);
    
    // Check for specific email errors
    if (err.code === 'EAUTH') {
      console.error("SMTP Authentication failed. Check your credentials.");
    } else if (err.code === 'ECONNECTION') {
      console.error("SMTP Connection failed. Check host and port.");
    }
    
    return new Response(
      JSON.stringify({ error: "Unable to process request. Please try again later." }), 
      { status: 500 }
    );
  }
}