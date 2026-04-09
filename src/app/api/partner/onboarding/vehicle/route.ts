import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import Vehicle from "@/app/models/vehicle.model";
import { NextRequest } from "next/server";

const VEHICLE_REGEX = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$|^[A-Z]{2}\d{6,7}$/;

export async function POST(req: Request) {
  try {
    await connectDb(); // ✅ missing

    const cookieHeader = req.headers.get("cookie");
    console.log("vehicle POST cookie header:", cookieHeader);

    const session = await auth();

    console.log("vehicle POST session:", session);

    if (!session || !session.user?.email) { // ❌ fixed session.l
      console.log("vehicle POST unauthorized - no session or email");
      return Response.json(
        { message: "unauthorized" },
        { status: 401 }
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



    let vehicle = await Vehicle.findOne({ owner: user._id }); // Check if user already has a vehicle

    if (vehicle) {
      // User already has a vehicle, update it
      vehicle.type = type;
      vehicle.number = vehicleNumber;
      vehicle.vehicleModel = vehicleModel;
      vehicle.status = "pending";

      await vehicle.save();
      if(user.partnerOnBoardingSteps < 2){
        user.partnerOnBoardingSteps = 2;
        user.partnerStatus = "pending";
        await user.save();
      }
      else{
        user.partnerOnBoardingSteps = 3;
        user.partnerStatus = "pending";
        await user.save();
      }
      return Response.json(vehicle, { status: 200 });
    }

    // User doesn't have a vehicle yet, check if this number is already taken by someone else
    const duplicate = await Vehicle.findOne({ number: vehicleNumber });
    if (duplicate) {
      return Response.json(
        { message: "Vehicle number already registered by another user" },
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
    user.partnerStatus = "pending";
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

    const cookieHeader = req.headers.get("cookie");
    console.log("vehicle GET cookie header:", cookieHeader);

    const session = await auth();

    if (!session || !session.user?.email) {
      console.log("vehicle GET unauthorized session:", session);
      return Response.json(
        { message: "unauthorized" },
        { status: 401 }
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

    const vehicle = await Vehicle.findOne({ owner: user._id });

    return Response.json(vehicle || {}, { status: 200 });

  } catch (error) {
    return Response.json(
      { message: "server error" },
      { status: 500 }
    );
  }
}