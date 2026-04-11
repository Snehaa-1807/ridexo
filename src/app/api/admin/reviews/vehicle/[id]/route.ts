import connectDb from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Vehicle from "@/app/models/vehicle.model";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check authentication and admin role
    if (!session || !session.user?.email || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDb();

    // Get vehicle ID from params
    const vehicleId = context.params.id;

    // Fetch vehicle and populate owner details
    const vehicle = await Vehicle.findById(vehicleId).populate("owner");

    if (!vehicle) {
      return NextResponse.json(
        { message: "vehicle not found" },
        { status: 404 }
      );
    }

    // Return vehicle data
    return NextResponse.json(vehicle, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: `vehicle review get error ${error}` },
      { status: 500 }
    );
  }
}