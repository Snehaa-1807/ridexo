import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const { latitude, longitude } = await req.json();

    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          isOnline: true,
          location: {
            type: "Point",
            coordinates: [longitude, latitude], // MongoDB: [lon, lat]
          },
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}