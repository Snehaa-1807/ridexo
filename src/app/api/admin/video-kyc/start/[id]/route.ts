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
    // Authenticate admin
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDb();

    // Await params (Next.js 15/16 compatible)
    const { id } = await context.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid Partner ID" },
        { status: 400 }
      );
    }

    // Find partner
    const partner = await User.findById(id);

    if (!partner || partner.role !== "partner") {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 404 }
      );
    }

    // Generate Room ID if it doesn't exist
    if (!partner.videoKycRoomId) {
      partner.videoKycRoomId = randomUUID();
    }

    // Update Video KYC status
    partner.videoKycStatus = "in_progress";

    // ✅ Solution 2: Automatically advance onboarding step to Video KYC
    if (
      !partner.partnerOnBoardingSteps ||
      partner.partnerOnBoardingSteps < 5
    ) {
      partner.partnerOnBoardingSteps = 5;
    }

    // Update timestamp
    partner.updatedAt = new Date();

    await partner.save();

    return NextResponse.json(
      {
        message: "Video KYC started successfully",
        roomId: partner.videoKycRoomId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error starting Video KYC:", error);
    return NextResponse.json(
      { message: "Failed to start Video KYC" },
      { status: 500 }
    );
  }
}