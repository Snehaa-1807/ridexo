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
return NextResponse.json({
booking:null
})
}

const user=
await User.findOne({
email:session.user.email
})

if(!user){
return NextResponse.json({
booking:null
})
}

const booking=
await Booking.findOne({
user:user._id,
bookingStatus:{
$in:[
"requested",
"awaiting_payment",
"payment",
"confirmed",
"started",
"rejected"
]
}
})
.sort({
createdAt:-1
})

if(!booking){
return NextResponse.json({
booking:null
})
}

return NextResponse.json({
booking
})

}
catch(error){

return NextResponse.json(
{
message:`active booking error ${error}`
},
{status:500}
)

}

}