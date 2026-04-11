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

    // Ensure only admin can start Video KYC
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDb();

    // Await params (Next.js 15/16)
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

    // Generate Room ID
    if (!partner.videoKycRoomId) {
      partner.videoKycRoomId = randomUUID();
    }

    // Update status
    partner.videoKycStatus = "in_progress";
    await partner.save();

    return NextResponse.json(
      { roomId: partner.videoKycRoomId },
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