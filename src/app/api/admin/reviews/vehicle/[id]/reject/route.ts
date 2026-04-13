import connectDb from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Vehicle from "@/app/models/vehicle.model";
import User from "@/app/models/user.model";

export async function POST(
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

    const body = await req.json();
    const reason = body.rejectionReason || body.reason;

    if (!reason) {
      return NextResponse.json({ message: "Rejection reason is required" }, { status: 400 });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }

    vehicle.status = "rejected";
    vehicle.rejectionReason = reason;
    await vehicle.save();

    // Roll partner back to step 5 so they can resubmit pricing
    const partner = await User.findById(vehicle.owner);
    if (partner) {
      partner.partnerOnBoardingSteps = 5;
      await partner.save();
    }

    return NextResponse.json({ message: "Vehicle rejected", vehicle }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `Reject error: ${error}` }, { status: 500 });
  }
}