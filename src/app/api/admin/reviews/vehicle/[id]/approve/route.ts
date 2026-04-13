import connectDb from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Vehicle from "@/app/models/vehicle.model";
import User from "@/app/models/user.model";

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

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }

    vehicle.status = "approved";
    vehicle.rejectionReason = undefined;
    await vehicle.save();

    // ✅ Step 8 = partner is fully onboarded and LIVE
    const partner = await User.findById(vehicle.owner);
    if (partner) {
      partner.partnerOnBoardingSteps = 8;
      await partner.save();
    }

    return NextResponse.json({ message: "Vehicle approved", vehicle }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `Approve error: ${error}` }, { status: 500 });
  }
}