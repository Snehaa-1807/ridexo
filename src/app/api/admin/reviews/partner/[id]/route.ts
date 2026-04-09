import { auth } from "@/auth";
import { NextRequest } from "next/server";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import PartnerDocs from "@/app/models/partnerDocs.model";
import PartnerBank from "@/app/models/partnerBank.models";
import Vehicle from "@/app/models/vehicle.model";
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

const vehicle=await Vehicle.findOne({ owner: partnerId });
const document=await PartnerDocs.findOne({ owner: partnerId });
const bank=await PartnerBank.findOne({ owner: partnerId });

return Response.json({
  partner,
  vehicle: vehicle || null,
  documents: document || null, // ✅ FIXED KEY
  bank: bank || null
},{ status: 200 });
} catch (error) {
      return Response.json(
    { message: `partner get error ${error}` },
    { status: 500 }
  );
  }
}