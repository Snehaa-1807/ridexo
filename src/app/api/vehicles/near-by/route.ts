import connectDb from "@/app/lib/db";
import Vehicle from "@/app/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    console.log("=== NEARBY API ===", body);

    const { latitude, longitude, vehicleType } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { message: "coordinates not found" },
        { status: 400 }
      );
    }

    const vehicles = await Vehicle.find({
      status: "approved",
      isActive: true,
      ...(vehicleType ? { type: vehicleType } : {}),
    }).lean();

    console.log(`Vehicles (type: ${vehicleType}):`, vehicles.length);
    return NextResponse.json(vehicles, { status: 200 });

  } catch (error) {
    console.error("NEARBY ERROR:", error);
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}