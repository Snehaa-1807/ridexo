import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/models/user.model";
import { randomUUID } from "crypto";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDb();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid Partner ID" }, { status: 400 });
    }

    const partner = await User.findById(id);

    if (!partner || partner.role !== "partner") {
      return NextResponse.json({ message: "Partner not found" }, { status: 404 });
    }

    if (!partner.videoKycRoomId) {
      partner.videoKycRoomId = randomUUID();
    }

    partner.videoKycStatus = "in_progress";

    // ✅ DO NOT change partnerOnBoardingSteps here.
    // Step only advances after admin approves in the complete API.
    // This prevents partner from accessing Pricing before KYC is done.

    partner.updatedAt = new Date();
    await partner.save();

    return NextResponse.json(
      { message: "Video KYC started successfully", roomId: partner.videoKycRoomId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error starting Video KYC:", error);
    return NextResponse.json({ message: "Failed to start Video KYC" }, { status: 500 });
  }
}