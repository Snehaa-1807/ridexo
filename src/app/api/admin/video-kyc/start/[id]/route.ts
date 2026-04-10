import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import { NextResponse } from "next/server";
import User from "@/app/models/user.model";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDb();

    const partners = await User.find({
      role: "partner",
      videoKycStatus: { $in: ["pending", "in_progress"] },
    })
      .select("_id name email videoKycStatus videoKycRoomId")
      .sort({ createdAt: -1 });

    return NextResponse.json(partners, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending Video KYC:", error);
    return NextResponse.json(
      { message: "Failed to fetch pending Video KYC" },
      { status: 500 }
    );
  }
}