import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import User from "@/app/models/user.model"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDb()
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    const foundUser = await User.findOne({ email: session.user.email })
    if (!foundUser) {
      return NextResponse.json({ message: "user not found" }, { status: 404 })
    }

    const bookings = await Booking.find({ user: foundUser._id })
      .populate("driver", "name mobileNumber")
      .populate("vehicle", "vehicleModel number type imageUrl")
      .sort({ createdAt: -1 })

    return NextResponse.json(bookings, { status: 200 })

  } catch (error) {
    return NextResponse.json(
      { message: `fetch bookings error: ${error}` },
      { status: 500 }
    )
  }
}