import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import { NextRequest } from "next/server";
import uploadOnCloudinary from "@/app/lib/cloudinary";
import PartnerDocs from "@/app/models/partnerDocs.model";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || !session.user?.email) {
      return Response.json(
        { message: "unauthorized" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return Response.json(
        { message: "user not found" },
        { status: 400 }
      );
    }

    const formdata = await req.formData();

    const aadhar = formdata.get("aadhar") as Blob | null;
    const license = formdata.get("license") as Blob | null;
    const rc = formdata.get("rc") as Blob | null;

    if (!aadhar || !license || !rc) {
      return Response.json(
        { message: "all documents are required" }, // ✅ typo fixed
        { status: 400 }
      );
    }

    const updatePayload: any = {
      status: "pending",
    };

    // Aadhaar
    const aadharUrl = await uploadOnCloudinary(aadhar);
    if (!aadharUrl) {
      return Response.json(
        { message: "Aadhar upload failed" },
        { status: 500 }
      );
    }
    updatePayload.aadharUrl = aadharUrl;

    // License
    const licenseUrl = await uploadOnCloudinary(license);
    if (!licenseUrl) {
      return Response.json(
        { message: "License upload failed" },
        { status: 500 }
      );
    }
    updatePayload.licenseUrl = licenseUrl;

    // RC
    const rcUrl = await uploadOnCloudinary(rc);
    if (!rcUrl) {
      return Response.json(
        { message: "RC upload failed" },
        { status: 500 }
      );
    }
    updatePayload.rcUrl = rcUrl;

    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      { $set: updatePayload },
      { upsert: true, new: true }
    );

    if (user.partnerOnBoardingSteps < 2) {
      user.partnerOnBoardingSteps = 2;
    }else{
      user.partnerOnBoardingSteps = 3;
    }
user.partnerStatus = "pending";
    await user.save(); // ❌ you were storing in wrong variable

    return Response.json(partnerDocs, { status: 201 }); // ✅ correct response

  } catch (error: any) {
  console.log("DOC UPLOAD ERROR:", error); // ✅ debug

  return Response.json(
    {
      message:
        error?.message ||
        error?.response?.data?.message ||
        "partner docs error",
    },
    { status: 500 }
  );
}
}