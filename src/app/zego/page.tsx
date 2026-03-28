"use client";

import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

function Page() {
  const { userData } = useSelector((state: RootState) => state.user);
  const containerRef = useRef<HTMLDivElement>(null);

  const startCall = async () => {
    if (!containerRef.current) return;

    try {
      const { ZegoUIKitPrebuilt } = await import(
        "@zegocloud/zego-uikit-prebuilt"
      );

      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

      // ✅ ALWAYS provide valid userID
      const userId =
        userData?._id?.toString() || "user_" + Math.random().toString(36);

      const userName =
        userData?.name || "Guest User";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret!,
        "room1",
        userId,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
      });

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      
      {/* ✅ Always works */}
      <button
        onClick={startCall}
        className="px-6 py-2 bg-black text-white rounded"
      >
        Start Call
      </button>

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default Page;