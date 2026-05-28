import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import User from "@/app/models/user.model"
import { auth } from "@/auth"
import error from "next/dist/api/error"
import { NextResponse } from "next/server"

export async function GET() {

  try {

    await connectDb()

    const session = await auth()

    if (!session || !session.user?.email) {

      return NextResponse.json(
        { message: "unauthorized" },
        { status: 400 }
      )

    }
const user = await User.findOne({
  email: session.user.email
})

const booking = await Booking.findOne({
  driver: user._id,
  bookingStatus: {
    $in: ["confirmed", "started", "completed"]
  }
})
  return NextResponse.json(
        booking,
        { status: 200 }
      )
  } catch (error) {

  return NextResponse.json(
    {
      message: `get active ride for partner error ${error}`
    },
    {
      status: 400
    }
  )

}

}