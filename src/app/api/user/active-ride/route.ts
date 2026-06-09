import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectDb()

    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    const { bookingId } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ message: "bookingId required" }, { status: 400 })
    }

    // Fix: was Booking.findOne(bookingId) — wrong, should be findById
    const booking = await Booking.findById(bookingId).populate("user vehicle driver")

    if (!booking) {
      return NextResponse.json({ message: "booking not found" }, { status: 404 })
    }

    return NextResponse.json(booking, { status: 200 })

  } catch (error) {
    return NextResponse.json(
      { message: `get active ride error: ${error}` },
      { status: 500 }
    )
  }
}