import connectDb from "@/app/lib/db";
import ChatMessage from "@/app/models/chatMessage.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { bookingId } = await req.json();

    const msgs = await ChatMessage.find({ bookingId }).sort({ createdAt: 1 });

    return NextResponse.json(msgs, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: `get all messages error ${error}`,
      },
      { status: 500 }
    );
  }
}