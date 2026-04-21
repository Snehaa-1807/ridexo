import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import User from "@/app/models/user.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    await connectDb()
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        {booking: null}
      )
    }

    const user = await User.findOne({ email: session.user.email })
const booking = await Booking.findOne({
  user: user._id,
  bookingStatus:{$in:["requested","awating_payment","confirmed","started"]}
})

if(!booking){
    return NextResponse.json(
    {booking:"idle"}
  )
}
return NextResponse.json(
    {booking}
  )
  } catch (error) {
return NextResponse.json(
    { message: `get active booking error${error}` },
    { status: 500 }
  )
  }
}