import connectDb from "@/app/lib/db";
import Booking from "@/app/models/booking.model"
import { getRazorpayClient } from "@/app/lib/razorpay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()

        const { bookingId } = await req.json()

        if (!bookingId) {
            return NextResponse.json(
                { message: "bookingId is required" },
                { status: 400 }
            )
        }

        const booking = await Booking.findById(bookingId)

        if (!booking) {
            return NextResponse.json(
                { message: "Booking not found" },
                { status: 404 }
            )
        }

        if (!booking.fare) {
            return NextResponse.json(
                { message: "Booking fare is not set" },
                { status: 400 }
            )
        }

        const razorpay = getRazorpayClient();
        const order = await razorpay.orders.create({
            amount: Math.round(booking.fare * 100), // Razorpay expects amount in paise
            currency: "INR",
            receipt: booking._id.toString(),
        });

        booking.bookingStatus = "awaiting_payment"
        await booking.save()

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
        },
        { status: 200 }
        )
    } catch (error: any) {
        console.error("Payment create error:", error?.message || error)
        return NextResponse.json(
            { message: `Payment create error: ${error?.message || error}` },
            { status: 500 }
        )
    }
}