import connectDb from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Vehicle from "@/app/models/vehicle.model";
import User from "@/app/models/user.model";

export async function POST(
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
const {reason}=await req.json()
    // Connect to database
    await connectDb();

    // Get vehicle ID from params
    const vehicleId = context.params.id;

    // Fetch vehicle and populate owner details
    const vehicle = await Vehicle.findById(vehicleId).populate("owner");

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Approve vehicle
    vehicle.status = "rejected";
    vehicle.rejectionReason = reason;
    await vehicle.save();



    return NextResponse.json(
      { vehicle },
      { status: 200 }
    );


  } catch (error) {
    return NextResponse.json(
      { message: `Vehicle rejected error: ${error}` },
      { status: 500 }
    );
  }
}