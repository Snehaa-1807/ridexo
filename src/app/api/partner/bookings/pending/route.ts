import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import User from "@/app/models/user.model"
import {auth} from "@/auth"
import {NextResponse} from "next/server"

export async function GET(){

try{

await connectDb()

const session=await auth()

if(!session?.user?.email){
return NextResponse.json(
{message:"unauthorized"},
{status:401}
)
}

const partner=
await User.findOne({
email:session.user.email
})

if(!partner){
return NextResponse.json(
{message:"partner not found"},
{status:404}
)
}


/* RETURN FULL REQUESTS NOT COUNT */
const bookings=
await Booking.find({
driver:partner._id,
bookingStatus:"requested"
})
.populate("user")
.populate("vehicle")
.sort({createdAt:-1})


return NextResponse.json(
{
bookings
},
{status:200}
)

}
catch(error){

return NextResponse.json(
{
message:`pending request error ${error}`
},
{status:500}
)

}

}