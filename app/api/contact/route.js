// app/api/contact/route.js
import { NextResponse } from "next/server";
import nodemailer from "@/lib/nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, orderNumber, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    // Message length validation
    if (message.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (error) {
      console.error("SMTP verification failed:", error);
      return NextResponse.json(
        { success: false, message: "Email service configuration error" },
        { status: 500 }
      );
    }

    // Email to admin
    const adminMailOptions = {
      from: `"7even86 Game Hub" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Admin email
      subject: `New Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 0;">
                      <div style="background: linear-gradient(135deg, #9d0208 0%, #6a0105 100%); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                          🎮 New Contact Form Submission
                        </h1>
                      </div>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">
                        You have received a new message from your website contact form:
                      </p>

                      <!-- Customer Details -->
                      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                          <td style="padding: 12px; background-color: #f8f9fa; border: 1px solid #e9ecef; font-weight: bold; color: #495057; width: 30%;">
                            Name:
                          </td>
                          <td style="padding: 12px; background-color: #ffffff; border: 1px solid #e9ecef; color: #212529;">
                            ${name}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; background-color: #f8f9fa; border: 1px solid #e9ecef; font-weight: bold; color: #495057;">
                            Email:
                          </td>
                          <td style="padding: 12px; background-color: #ffffff; border: 1px solid #e9ecef; color: #212529;">
                            <a href="mailto:${email}" style="color: #9d0208; text-decoration: none;">${email}</a>
                          </td>
                        </tr>
                        ${orderNumber ? `
                        <tr>
                          <td style="padding: 12px; background-color: #f8f9fa; border: 1px solid #e9ecef; font-weight: bold; color: #495057;">
                            Order Number:
                          </td>
                          <td style="padding: 12px; background-color: #ffffff; border: 1px solid #e9ecef; color: #212529;">
                            ${orderNumber}
                          </td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 12px; background-color: #f8f9fa; border: 1px solid #e9ecef; font-weight: bold; color: #495057;">
                            Subject:
                          </td>
                          <td style="padding: 12px; background-color: #ffffff; border: 1px solid #e9ecef; color: #212529;">
                            ${subject}
                          </td>
                        </tr>
                      </table>

                      <!-- Message -->
                      <div style="margin: 30px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #212529; font-size: 18px; font-weight: bold;">
                          Message:
                        </h3>
                        <div style="padding: 20px; background-color: #f8f9fa; border-left: 4px solid #9d0208; color: #495057; line-height: 1.6;">
                          ${message.replace(/\n/g, '<br>')}
                        </div>
                      </div>

                      <!-- Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
                           style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #9d0208 0%, #6a0105 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                          Reply to Customer
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #003049; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 16px; font-weight: bold;">
                        7even86 Game Hub
                      </p>
                      <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">
                        Gulberg, Karachi, Pakistan<br>
                        Phone: +92 330 2533241<br>
                        Email: 7even86gamehub@gmail.com
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Auto-reply to customer
    const customerMailOptions = {
      from: `"7even86 Game Hub Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We received your message: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You for Contacting Us</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 0;">
                      <div style="background: linear-gradient(135deg, #9d0208 0%, #6a0105 100%); padding: 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                          🎮 7even86 Game Hub
                        </h1>
                        <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                          Thank You for Contacting Us!
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Dear <strong>${name}</strong>,
                      </p>

                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        We have received your message and our team will get back to you within <strong>24 hours</strong>. 
                        We appreciate your patience and look forward to assisting you.
                      </p>

                      <!-- Message Summary -->
                      <div style="margin: 30px 0; padding: 25px; background-color: #f8f9fa; border-left: 4px solid #9d0208; border-radius: 5px;">
                        <h3 style="margin: 0 0 15px 0; color: #212529; font-size: 18px;">
                          Your Message Summary:
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: bold;">Subject:</td>
                            <td style="padding: 8px 0; color: #212529; font-size: 14px;">${subject}</td>
                          </tr>
                          ${orderNumber ? `
                          <tr>
                            <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: bold;">Order #:</td>
                            <td style="padding: 8px 0; color: #212529; font-size: 14px;">${orderNumber}</td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: bold; vertical-align: top;">Message:</td>
                            <td style="padding: 8px 0; color: #212529; font-size: 14px;">${message.substring(0, 100)}${message.length > 100 ? '...' : ''}</td>
                          </tr>
                        </table>
                      </div>

                      <!-- Quick Links -->
                      <div style="margin: 30px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #212529; font-size: 18px;">
                          While You Wait:
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 10px 0;">
                              <a href="${process.env.NEXTAUTH_URL}/faq" style="color: #9d0208; text-decoration: none; font-size: 15px;">
                                📚 Check our FAQ
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <a href="${process.env.NEXTAUTH_URL}/warranty" style="color: #9d0208; text-decoration: none; font-size: 15px;">
                                🛡️ View our 7 Days Exchange Policy
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <a href="${process.env.NEXTAUTH_URL}/all-products" style="color: #9d0208; text-decoration: none; font-size: 15px;">
                                🎮 Browse our Products
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Contact Info -->
                      <div style="margin: 30px 0; padding: 20px; background-color: #e9ecef; border-radius: 5px;">
                        <h3 style="margin: 0 0 15px 0; color: #212529; font-size: 16px; text-align: center;">
                          Need Immediate Assistance?
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="text-align: center; padding: 10px;">
                              <a href="https://wa.me/923302533241" style="display: inline-block; padding: 12px 25px; background-color: #25D366; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">
                                💬 WhatsApp Us
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td style="text-align: center; padding: 10px;">
                              <a href="tel:+923302533241" style="display: inline-block; padding: 12px 25px; background-color: #003049; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">
                                📞 Call Us
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #003049; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 16px; font-weight: bold;">
                        7even86 Game Hub
                      </p>
                      <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.7); font-size: 14px;">
                        Your trusted gaming store in Pakistan
                      </p>
                      <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px;">
                        📍 Gulberg, Karachi, Pakistan<br>
                        📞 +92 330 2533241<br>
                        📧 7even86gamehub@gmail.com
                      </p>
                      <div style="margin: 20px 0 0 0;">
                        <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                          Business Hours: Monday - Saturday, 10:00 AM - 8:00 PM (PKT)
                        </p>
                      </div>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully! We'll get back to you within 24 hours.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message. Please try again later.",
      },
      { status: 500 }
    );
  }
}