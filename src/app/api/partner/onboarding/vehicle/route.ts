import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import Vehicle from "@/app/models/vehicle.model";
import { NextRequest } from "next/server";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{0,2}[0-9]{4}$/;

export async function POST(req: Request) {
  try {
    await connectDb(); // ✅ missing

    const session = await auth();

    if (!session || !session.user?.email) { // ❌ fixed session.l
      return Response.json(
        { message: "unauthorized" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return Response.json(
        { message: "user not found" },
        { status: 400 }
      );
    }

    const { type, number, vehicleModel } = await req.json();

    if (!type || !number || !vehicleModel) {
      return Response.json(
        { message: "missing Required details" },
        { status: 400 }
      );
    }

    // ❌ wrong condition fixed
    if (!VEHICLE_REGEX.test(number)) {
      return Response.json(
        { message: "Invalid Vehicle number format" },
        { status: 400 }
      );
    }

    const vehicleNumber = number.toUpperCase();



    let vehicle = await Vehicle.findOne({ owner: user._id }); // ❌ fixed syntax

    if (vehicle) {
      vehicle.type = type;
      vehicle.number = vehicleNumber;
      vehicle.vehicleModel = vehicleModel;
      vehicle.status = "pending";

      await vehicle.save();

      return Response.json(vehicle, { status: 200 });
    }
   const duplicate = await Vehicle.findOne({ number: vehicleNumber });
    if (duplicate) {
      return Response.json(
        { message: "Vehicle already registered" },
        { status: 400 }
      );
    }
    // ❌ create new vehicle (missing before)
    vehicle = await Vehicle.create({
      owner: user._id,
      type,
      number: vehicleNumber,
      vehicleModel,
      status: "pending",
      pricePerKM: 0, // required field fallback
    });

    if (user.partnerOnBoardingSteps < 1) {
      user.partnerOnBoardingSteps = 1;
    }

    user.role = "partner";
    await user.save();

    return Response.json(vehicle, { status: 201 });

  } catch (error) {
    return Response.json(
      { message: `vehicle error ${error}` }, // ❌ fixed syntax
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || !session.user?.email) {
      return Response.json(
        { message: "unauthorized" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return Response.json(
        { message: "user not found" },
        { status: 400 }
      );
    }

    return Response.json(user, { status: 200 });

  } catch (error) {
    return Response.json(
      { message: "server error" },
      { status: 500 }
    );
  }
}