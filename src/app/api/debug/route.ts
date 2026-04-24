import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import Vehicle from "@/app/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    // Get ALL partners regardless of any filter
    const allPartners = await User.find({ role: "partner" }).lean();

    // Get ALL vehicles regardless of any filter  
    const allVehicles = await Vehicle.find({}).lean();

    return NextResponse.json({
      totalPartners: allPartners.length,
      partners: allPartners.map((p: any) => ({
        id: p._id,
        name: p.name,
        isOnline: p.isOnline,
        isOnlineType: typeof p.isOnline,
        partnerStatus: p.partnerStatus,
        hasLocation: !!p.location,
        location: p.location,
      })),
      totalVehicles: allVehicles.length,
      vehicles: allVehicles.map((v: any) => ({
        id: v._id,
        model: v.vehicleModel,
        type: v.type,
        status: v.status,
        isActive: v.isActive,
        isActiveType: typeof v.isActive,
        owner: v.owner,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}