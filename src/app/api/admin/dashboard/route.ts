import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import Vehicle from "@/app/models/vehicle.model"; // ✅ FIXED (missing import)

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || !session.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 }); // ✅ FIXED
    }

    const totalPartners = await User.countDocuments({ role: "partner" });
    const totalApproved = await User.countDocuments({ role: "partner", partnerStatus: "approved" });
    const totalPending = await User.countDocuments({ role: "partner", partnerStatus: "pending" });
    const totalRejected = await User.countDocuments({ role: "partner", partnerStatus: "rejected" });

    const pendingPartnerUsers = await User.find({
      role: "partner",
      partnerStatus: "pending",
      partnerOnBoardingSteps: 3
    });

    const partnerIds = pendingPartnerUsers.map((p) => p._id);

    const partnerVehicles = await Vehicle.find({ owner: { $in: partnerIds } });

    const vehicleTypeMap = new Map(
      partnerVehicles.map((v) => [String(v.owner), v.type])
    );

    const pendingPartnerReviews = pendingPartnerUsers.map((p) => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      vehicleType: vehicleTypeMap.get(String(p._id))
    }));

    return NextResponse.json({
      Stats: { // ✅ FIXED (invalid syntax removed)
        totalApprovedPartners: totalApproved,
        totalPendingPartners: totalPending,
        totalRejectedPartners: totalRejected,
        totalPartners: totalPartners,
      },
      pendingPartnerReviews,
    }, {
      status: 200
    });

  } catch (error) {
    return NextResponse.json(
      { message: `Error fetching dashboard data ${error}` },
      { status: 500 }
    );
  }
}