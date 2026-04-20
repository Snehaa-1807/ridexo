import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import Vehicle from "@/app/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { latitude, longitude, vehicleType } = await req.json();

    // ✅ FIX validation block
    if (!latitude || !longitude) {
      return NextResponse.json(
        { message: "coordinates not found" },
        { status: 400 }
      );
    }

    // ✅ FIX $geometry + syntax
    const partner = await User.find({
      role: "partner",
      isOnline: true,
      partnerStatus: "approved",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 10000
        }
      }
    });

    // ✅ FIX variable name
    const partnerIds = partner.map(p => p._id);

    if (partnerIds.length === 0) {
      return NextResponse.json(
        [],
        { status: 200 }
      );
    }

    const vehicles = await Vehicle.find({
      owner: { $in: partnerIds },
      type: vehicleType,
      status: "approved",
      isActive: true
    }).lean();

    return NextResponse.json(vehicles, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: `nearby vehicles error ${error}` },
      { status: 500 }
    );
  }
}