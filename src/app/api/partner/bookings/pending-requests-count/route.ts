import connectDb from "@/app/lib/db";
import Booking from "@/app/models/booking.model";
import User from "@/app/models/user.model";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb()
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "unauthorized" },
        { status: 400 }
      )
    }

    const partner = await User.findOne({ email: session.user.email })

    if (!partner) {
      return NextResponse.json(
        { message: "partner not found" },
        { status: 400 }
      )
    }
const count=await Booking.countDocuments({
driver:partner._id,
bookingStatus:"requested"
})
return NextResponse.json(
       count,
        { status: 200 }
      )
  } catch (error) {
return NextResponse.json(
        { message: `fetch pending request count err ${error}` },
        { status: 500 }
      )
  }
}