import connectDb from "@/app/lib/db";
import PartnerBank from "@/app/models/partnerBank.models";
import PartnerDocs from "@/app/models/partnerDocs.model";
import User from "@/app/models/user.model";
import { auth } from "@/auth";
import { NextRequest } from "next/server"

export async function POST(
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
    const {rejectReason} = await req.json();
    const partnerId= (await context.params).id;
    const partner=await User.findById(partnerId);
      if (!partner || partner.role !== "partner") {
      return Response.json(
        { message: "partner not found" },
        { status: 400 }
      );
    }



partner.partnerStatus = "rejected";
partner.rejectionReason=rejectReason;
await partner.save();

return Response.json(
    { message: "partner rejected successfully" },{ status: 200 }
)

        }catch(error){
return Response.json(
    { message: `partner rejected error${error}` },{ status: 500 }
)
        }
    
}