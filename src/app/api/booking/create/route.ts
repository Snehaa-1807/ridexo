import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import User from "@/app/models/user.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import mongoose from "mongoose"

export async function POST(req: NextRequest) {
  try {
    await connectDb()
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
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

    if (!driverId || !vehicleId || !pickUpLocation?.coordinates || !dropLocation?.coordinates) {
      return NextResponse.json({ message: "missing required details" }, { status: 400 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ message: "user not found" }, { status: 404 })

    const driver = await User.findById(driverId)
    if (!driver) return NextResponse.json({ message: "driver not found" }, { status: 400 })

    console.log("=== BOOKING CREATE ===")
    console.log("driverId:", driverId)
    console.log("driver._id:", driver._id)
    console.log("driver.socketId:", driver.socketId)

    // Check existing active booking
    const existing = await Booking.findOne({
      user: user._id,
      bookingStatus: { $in: ["requested", "awaiting_payment", "confirmed", "started"] },
    })
    if (existing) {
      console.log("Existing booking found:", existing._id)
      return NextResponse.json(existing)
    }

    const booking = await Booking.create({
      user:               user._id,
      driver:             new mongoose.Types.ObjectId(driverId), // ← explicit ObjectId cast
      vehicle:            new mongoose.Types.ObjectId(vehicleId),
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare:               Number(fare),
      userMobileNumber:   mobileNumber,
      driverMobileNumber: driver.mobileNumber,
      bookingStatus:      "requested",
    })

    console.log("Booking created:", booking._id)
    console.log("Booking driver field:", booking.driver)

    // Emit to socket server
    const socketUrl = process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_SERVER_URL
    console.log("Socket URL:", socketUrl)

    if (socketUrl) {
      try {
        const { data: emitResult } = await axios.post(
          `${socketUrl}/emit`,
          { event: "new-booking", userId: driverId, data: booking },
          { timeout: 3000 }
        )
        console.log("Emit result:", emitResult)
      } catch (emitError: any) {
        console.log("Emit failed:", emitError?.message)
      }
    } else {
      console.warn("No SOCKET_SERVER_URL set")
    }

    return NextResponse.json(booking, { status: 200 })

  } catch (error) {
    console.error("Booking create error:", error)
    return NextResponse.json({ message: `create booking error: ${error}` }, { status: 500 })
  }
}