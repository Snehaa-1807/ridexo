import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const partner = await User.findOne({
      email: session.user.email,
    });

    if (!partner) {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 404 }
      );
    }

    // Prevent request if already in progress or approved
    if (
      partner.videoKycStatus === "pending" ||
      partner.videoKycStatus === "in_progress" ||
      partner.videoKycStatus === "approved"
    ) {
      return NextResponse.json(
        { message: "Video KYC already requested" },
        { status: 400 }
      );
    }

    // Reset and request KYC
    partner.videoKycStatus = "pending";
    partner.videoKycRoomId = undefined;
    partner.videoKycRejectionReason = undefined;

    await partner.save();

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `KYC request error: ${error}` },
      { status: 500 }
    );
  }
}