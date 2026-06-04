import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import User from "@/app/models/user.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function POST(req: NextRequest) {
  try {
    await connectDb()
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "unauthorized" },
        { status: 401 }
      )
    }

    const {
      driverId,
      vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      mobileNumber,
    } = await req.json()

    if (
      !driverId ||
      !vehicleId ||
      !pickUpLocation?.coordinates ||
      !dropLocation?.coordinates
    ) {
      return NextResponse.json(
        { message: "missing required details" },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json(
        { message: "user not found" },
        { status: 404 }
      )
    }

    const driver = await User.findById(driverId)

    if (!driver) {
      return NextResponse.json(
        { message: "driver not found" },
        { status: 400 }
      )
    }

    // Return existing active booking if any
    const existing = await Booking.findOne({
      user: user._id,
      bookingStatus: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const booking = await Booking.create({
      user: user._id,
      driver: driverId,
      vehicle: vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      userMobileNumber: mobileNumber,
      driverMobileNumber: driver.mobileNumber,
      bookingStatus: "requested",
    })

    console.log("Booking created:", booking._id)

    // Emit to socket server via HTTP /emit endpoint
    const socketUrl =
      process.env.SOCKET_SERVER_URL ||
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL

    if (socketUrl) {
      try {
        const { data: emitResult } = await axios.post(
          `${socketUrl}/emit`,
          {
            event: "new-booking",
            userId: driverId,
            data: booking,
          },
          { timeout: 3000 }
        )
        console.log("Socket emit result:", emitResult)
      } catch (emitError) {
        // Non-fatal — booking is already saved, just log
        console.log("Socket emit failed (non-fatal):", emitError)
      }
    } else {
      console.warn("SOCKET_SERVER_URL not set — skipping real-time notification")
    }

    return NextResponse.json(booking, { status: 200 })

  } catch (error) {
    return NextResponse.json(
      { message: `create booking error: ${error}` },
      { status: 500 }
    )
  }
}