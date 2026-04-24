import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import User from "@/app/models/user.model"
import {auth} from "@/auth"
import {NextResponse} from "next/server"

export async function GET(){

try{

await connectDb()

const session=await auth()

const partner=
await User.findOne({
email:session?.user?.email
})

const bookings=
await Booking.find({
driver:partner._id, // SAME FIELD
bookingStatus:"requested"
})
.populate("user")
.populate("vehicle")
.sort({createdAt:-1})

console.log(
"pending requests:",
bookings.length
)

return NextResponse.json({
bookings
})

}
catch(error){

console.log(error)

return NextResponse.json(
{message:"error"},
{status:500}
)

}

}