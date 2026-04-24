import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const result = await User.findOneAndUpdate(
      { email: "23eo10sn65@mitsgwl.ac.in" },
      {
        $set: {
          isOnline: true,
          location: {
            type: "Point",
            coordinates: [77.4126, 23.2599],
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      updated: {
        name: result?.name,
        isOnline: result?.isOnline,
        location: result?.location,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}