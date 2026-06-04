import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import User from "@/app/models/user.model"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDb()

    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    const partner = await User.findOne({ email: session.user.email })

    if (!partner) {
      return NextResponse.json({ message: "partner not found" }, { status: 404 })
    }

    const bookings = await Booking.find({
      driver: partner._id,
      bookingStatus: "requested",
    })
      .populate("user")
      .populate("vehicle")
      .sort({ createdAt: -1 })

    console.log("pending requests:", bookings.length)

    // Return array directly — not wrapped in object
    return NextResponse.json(bookings)

  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "error" }, { status: 500 })
  }
}