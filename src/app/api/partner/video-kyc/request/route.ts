import connectDb from "@/app/lib/db"
import User from "@/app/models/user.model"
import { auth } from "@/auth"

export async function GET(){
    try {
  await connectDb()
  const session = await auth()

  if (!session || !session.user?.email) {
    return Response.json(
      { message: "unauthorized" },
      { status: 401 }
    )
  }

  const partner = await User.findOne({
    email: session.user.email,
  })

  if (!partner) {
    return Response.json(
      { message: "partner not found" },
      { status: 404 }
    )
  }
if(partner.videoKycStatus! == "rejected"){
    return Response.json(
        { message: "Your video KYC has been rejected. Please contact support for further assistance." },{status: 400}
    )
}
partner.videoKycStatus = "pending"
partner.VideoKycReason=undefined
partner.videoKycRoomId=undefined
 return Response.json(
    { success: true },
    { status: 200 }
  )
} catch (error) {
  return Response.json(
    { message: `kyc request error ${error}` },
    { status: 500 }
  )
}
}