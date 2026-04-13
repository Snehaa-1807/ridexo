import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendMail } from "@/app/lib/sendMail";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDb();

    let user = await User.findOne({ email });

    if (user && user.isEmailVerified) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user && !user.isEmailVerified) {
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      user.password = hashedPassword;
      user.name = name;
      await user.save();
    } else {
      await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        role: "user", // ✅ was missing — schema requires this field
      });
    }

    await sendMail(
      email,
      "Your OTP for Ridexo Verification",
      `<h2>Your OTP for Ridexo Verification is <strong>${otp}</strong></h2>`
    );

    return NextResponse.json({ message: "OTP sent to your email" }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ message: `Register error: ${err.message}` }, { status: 500 });
  }
}