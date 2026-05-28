import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {

    try {

        await connectDb()

        const bookingId = (await context.params).id
const booking = await Booking.findById(bookingId)
        
                if (!booking) {
                    return NextResponse.json(
                        { success: false, message: "booking is not found." },
                    )
                }
const adminCommission = booking.fare * 0.10

const partnerAmount = booking.fare - adminCommission


booking.paymentStatus = "cash"
booking.bookingStatus = "confirmed"

await booking.save()

return NextResponse.json(
    { success: true },
    { status: 200 }
)
    } catch (error) {
return NextResponse.json(
    { success: false, message: `cash confirm error: ${error}` },
    { status: 500 }
)
 
    }

}