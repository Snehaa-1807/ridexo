import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const { id } = await context.params;

    const body = await req.json();
    const rejectReason = body.rejectReason || body.rejectionReason || body.reason;

    if (!rejectReason) {
      return Response.json({ message: "Rejection reason is required" }, { status: 400 });
    }

    const partner = await User.findById(id);
    if (!partner || partner.role !== "partner") {
      return Response.json({ message: "Partner not found" }, { status: 404 });
    }

    partner.partnerStatus = "rejected";
    partner.rejectionReason = rejectReason;
    // Roll back to step 3 so partner can fix and resubmit
    partner.partnerOnBoardingSteps = 3;
    await partner.save();

    return Response.json({ message: "Partner rejected successfully" }, { status: 200 });
  } catch (error) {
    return Response.json({ message: `Partner reject error: ${error}` }, { status: 500 });
  }
}