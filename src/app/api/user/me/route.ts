import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";

// Force this route to always fetch fresh data — never use Next.js cache
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        partnerOnBoardingSteps: user.partnerOnBoardingSteps,
        partnerStatus: user.partnerStatus,
        rejectionReason: user.rejectionReason,
        videoKycStatus: user.videoKycStatus,
        videoKycRoomId: user.videoKycRoomId,
        videoKycRejectionReason: user.videoKycRejectionReason,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error("GET ME ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}