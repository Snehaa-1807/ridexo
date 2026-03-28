import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("GET ME ERROR:", error); // 🔥 VERY IMPORTANT

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}