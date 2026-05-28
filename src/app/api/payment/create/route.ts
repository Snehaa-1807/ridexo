import connectDb from "@/app/lib/db";
import Booking from "@/app/models/booking.model"
import razorpay from "@/app/lib/razorpay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()

        const { bookingId } = await req.json()

        const booking = await Booking.findById(bookingId)

        if (!booking) {
            return NextResponse.json(
                { message: "booking is not found." },
           {status: 400}
            )
        }
const order=await razorpay.orders.create({
    amount: booking.fare * 100, // Razorpay expects amount in paise
    currency: "INR",
    receipt: booking._id.toString(),
});
booking.bookingStatus="awaiting_payment"
await booking.save()
return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
},
{status: 200}
)
    } catch (error) {
        return NextResponse.json(
            { message: `payment create error ${error}` },
            { status: 500 }
        )
    }
}