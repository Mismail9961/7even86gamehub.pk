import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, phoneNumber, area, city, state, pincode, landmark, isDefault } = await req.json();

    if (!fullName || !phoneNumber || !area || !city || !state || !pincode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // If isDefault is true, reset previous default addresses
    if (isDefault) {
      await User.updateOne(
        { _id: session.user.id },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const newAddress = {
      fullName,
      phoneNumber,
      area,
      city,
      state,
      pincode,
      landmark: landmark || "",
      isDefault: !!isDefault
    };

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $push: { addresses: newAddress } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      addresses: updatedUser.addresses
    });

  } catch (error) {
    console.error("Error adding address:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
