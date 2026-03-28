import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { NextRequest } from "next/server";
import PartnerBank from "@/app/models/partnerBank.models";
export async function POST(req: NextRequest) {
  try {
    await connectDb()

    const session = await auth()

    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 400 })
    }

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return Response.json({ message: "user not found" }, { status: 400 })
    }

    const {accountHolder, accountNumber, upi,ifsc,mobileNumber}=await req.json()
    if(!accountHolder || !accountNumber || !ifsc || !mobileNumber){
      return Response.json({ message: "send all bank details" }, { status: 400 })
    }
const partnerBank=await PartnerBank.findOneAndUpdate(
    {owner:user._id},
    {accountHolder, accountNumber, upi,ifsc,mobileNumber

    },{upsert:true,new:true}
)user.mobileNumber=mobileNumber
if(user.partnerOnBoardingSteps<3){
    user.partnerOnBoardingSteps=3
}
await user.save()
      return Response.json(partnerBank, { status: 201 })

  } catch (error) {
      return Response.json({ message: `partner bank error ${error}` }, { status: 500 })

  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb()

    const session = await auth()

    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 400 })
    }

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return Response.json({ message: "user not found" }, { status: 400 })
    }
const partnerBank=await PartnerBank.findOneAndUpdate({owner:user._id})
if(partnerBank){
    return Response.json(partnerBank,{status:200})
}else{
    return null
}

  } catch (error) {
      return Response.json({ message: `get partner bank error ${error}` }, { status: 500 })

  }
}