import connectDb from "@/app/lib/db";
import { sendMail } from "@/app/lib/sendMail";
import Booking from "@/app/models/booking.model";
import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { bookingId } = await req.json();

    const booking = await Booking.findById(bookingId).populate("user");

    if (!booking) {
      return NextResponse.json(
        { message: "booking not found" },
        { status: 400 }
      );
    }

    if(!booking.pickupOtp){
        return NextResponse.json(
        { message: "pickup OTP not generated" },
        { status: 400 }
      );
    }
     if(booking.pickupOtp!=otp){
        return NextResponse.json(
        { message: " incorrect pickup OTP" },
        { status: 400 }
      );
    }
     if(booking.pickupOtpExpires<new Date()){
        return NextResponse.json(
        { message: "pickup OTP expired" },
        { status: 400 }
      );
    }
    booking.bookingStatus =  "started"
    booking.pickupOtp = "";
booking.pickupOtpExpires = undefined;
await booking.save(); 

return NextResponse.json(
      { message: "pickup OTP verified" },
      { status: 200 }
    );
} catch (error) {
    return NextResponse.json(
      { message: "Error verifying pickup OTP" },
      { status: 500 }
    );
  }
}