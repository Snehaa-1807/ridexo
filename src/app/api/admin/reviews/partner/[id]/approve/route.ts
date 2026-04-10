import connectDb from "@/app/lib/db";
import PartnerBank from "@/app/models/partnerBank.models";
import PartnerDocs from "@/app/models/partnerDocs.model";
import User from "@/app/models/user.model";
import { auth } from "@/auth";
import { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
        try{
            const session = await auth();
    
        if (!session || !session.user?.email || session.user.role !== "admin") {
          return Response.json(
            { message: "unauthorized" },
            { status: 400 }
          );
        }
    await connectDb();
    const partnerId= (await context.params).id;
    const partner=await User.findById(partnerId);
      if (!partner || partner.role !== "partner") {
      return Response.json(
        { message: "partner not found" },
        { status: 400 }
      );
    }
if (partner.partnerStatus === "approved") {
  return Response.json(
    { message: "partner already Approved" },
    { status: 400 }
  );
}
const partnerDocs=await PartnerDocs.findOne({ owner: partner._id });

const partnerBank=await PartnerBank.findOne({ owner: partner._id });
if (!partnerDocs || !partnerBank) {
  return Response.json(
    { message: "partner did not complete on boarding process " },
    { status: 400 }
  );
}

partner.partnerStatus = "approved";
partner.videoKycStatus = "pending";
partner.partnerOnBoardingSteps = 4;

await partner.save();
partnerDocs.status = "approved";
await partnerDocs.save();
partnerBank.status = "verified";
await partnerBank.save();
return Response.json(
    { message: "partner approved successfully" },{ status: 200 }
)

        }catch(error){
return Response.json(
    { message: `partner approved error${error}` },{ status: 500 }
)
        }
    
}