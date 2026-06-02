import connectDb from "@/app/lib/db"
import Booking from "@/app/models/booking.model"
import {NextRequest,NextResponse} from "next/server"
import axios from "axios"

export async function POST(
req:NextRequest,
context:{params:Promise<{id:string}>}
){

try{

await connectDb()

const id=(await context.params).id

const booking=
await Booking.findById(id)

if(
!booking ||
booking.bookingStatus!=="requested"
){
return NextResponse.json(
{message:"invalid booking"},
{status:400}
)
}

booking.bookingStatus=
"awaiting_payment"

await booking.save()
await axios.post(
  `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`,
  {
    event: "accept-booking",
    userId: booking.user,
    data: booking.bookingStatus
  }
)
return NextResponse.json(
{
success:true,
message:"ride accepted"
}
)

}catch(error){

console.log(error)

return NextResponse.json(
{
message:`accept error ${error}`
},
{status:500}
)

}

}