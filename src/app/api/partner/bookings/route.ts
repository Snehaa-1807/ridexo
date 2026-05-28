import Booking from "@/app/models/booking.model"
import { NextResponse , NextRequest} from "next/server"
import connectDb from "@/app/lib/db";
import { auth } from "@/auth";
import User from "@/app/models/user.model";
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
const driver=await User.findOne({email:session.user.email})
    const bookings = await Booking.find({
      driver:driver._id,
    })
      .populate("user driver vehicle")
      .sort({ createdAt: -1 })

    return NextResponse.json( bookings,
        {status: 200}
    )

  } catch (error) {
 return NextResponse.json( { message: `get bookings for partner error: ${error}` },
        {status: 400}
    )
  }
}