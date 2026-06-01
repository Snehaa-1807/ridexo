
import connectDb from "@/app/lib/db";
import ChatMessage from "@/app/models/chatMessage.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { bookingId, sender, text } = await req.json();

    const msg = await ChatMessage.create({
      bookingId,
      sender,
      text,
    });

    return NextResponse.json(msg, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: `send message error ${error}`,
      },
      { status: 500 }
    );
  }
}