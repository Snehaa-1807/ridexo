import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest) {
    try{
        await connectDb();
const session = await auth();
if(!session || session.user?.role !== "admin" || !session.user?.email){
    return Response.json(
        { message: "Unauthorized" },
        { status: 400 }
      );
}
const {roomId,action,reason}=await req.json();
if(!roomId){
    return Response.json(
        { message: "roomId is required" },
        { status: 400 }
    )
}  
if(!["approved","rejected"].includes(action)){
    return Response.json(
        { message: "Invalid action" },
        { status: 400 }
    )
}
const partner=await User.findOne({ videoKyc: roomId,role:"partner" });
if(!partner){
    return Response.json(
        { message: "Partner not found" },
        { status: 404 }
    )
}
if(action==="approved"){
    partner.videoKycStatus="approved";
    partner.videoKycRejectionReason=undefined;
    partner.partnerOnBoardingSteps=5;

}
if(action==="rejected"){
    if(!reason){
        return Response.json({ message: "Reason is required for rejection" })

    }
     partner.videoKycStatus="rejected";
    partner.videoKycRejectionReason=reason.trim();
}

await partner.save();
return Response.json(
    { status: partner.videoKycStatus, },
    { status: 200 }
);
}catch(error){
return Response.json(
    { message: `Error processing Video KYC result: ${error}` },{status:500}
)
}
}
