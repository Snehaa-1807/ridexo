"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";
import axios from "axios";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  X,
  CheckCircle,
  XCircle,
  PhoneOff,
} from "lucide-react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

function Page() {
  const { userData } = useSelector((state: RootState) => state.user);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  const [joined, setJoined] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [aLoading, setALoading] = useState(false);
  const [rLoading, setRLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // ✅ Extract roomId correctly
  const params = useParams();
  const roomId = params?.roomId as string;

  // Initialize camera and mic preview
  useEffect(() => {
    if (joined) return;

    let localStream: MediaStream;

    const init = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localStream);

        if (previewRef.current) {
          previewRef.current.srcObject = localStream;
        }
      } catch (error) {
        console.log(error);
      }
    };

    init();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [joined]);

  // Toggle Camera
  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !isCameraOn;
    });
    setIsCameraOn(!isCameraOn);
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !isMicOn;
    });
    setIsMicOn(!isMicOn);
  };

  // Approve Video KYC
  const handleApprove = async () => {
    setALoading(true);
    try {
      const { data } = await axios.post(
        "/api/admin/video-kyc/complete",
        {
          roomId,
          action: "approved",
        }
      );
      console.log("Approval Response:", data);
    } catch (error: any) {
      console.log(
        error?.response?.data?.message || error.message || error
      );
    } finally {
      setALoading(false);
      setShowApprovalModal(false);
    }
  };

  // Reject Video KYC
  const handleReject = async () => {
    setRLoading(true);
    try {
      const { data } = await axios.post(
        "/api/admin/video-kyc/complete",
        {
          roomId,
          action: "rejected",
          reason,
        }
      );
      console.log("Rejection Response:", data);
    } catch (error: any) {
      console.log(
        error?.response?.data?.message || error.message || error
      );
    } finally {
      setRLoading(false);
      setShowRejectionModal(false);
    }
  };

  // Start Zego Video Call
  const startCall = async () => {
    if (!containerRef.current || !userData?.videoKycRoomId) return;

    setLoading(true);

    const displayName =
      userData?.role === "admin"
        ? "Admin"
        : `${userData?.name} (${userData?.email})`;

    try {
      const { ZegoUIKitPrebuilt } = await import(
        "@zegocloud/zego-uikit-prebuilt"
      );

      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret =
        process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

      if (!appId || !serverSecret) {
        console.error("Zego credentials are missing.");
        return;
      }

      const roomID = userData.videoKycRoomId;

      const kitToken =
        ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret,
          roomID,
          userData?._id?.toString(),
          displayName
        );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
      });

      setJoined(true);
    } catch (error) {
      console.error("Error starting call:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Image src="/logo.png" alt="logo" width={44} height={44} priority />
        <p className="text-xs text-gray-400">
          {userData?.role === "admin"
            ? "Admin Verification"
            : "Partner Video KYC"}
        </p>
      </div>

      {/* Admin Controls */}
      {joined && (
        <div className="flex flex-wrap gap-3 p-4">
          {userData?.role === "admin" && (
            <>
              <button
                onClick={() => setShowApprovalModal(true)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm flex items-center gap-2 text-white"
              >
                <CheckCircle size={16} /> Approve
              </button>

              <button
                onClick={() => setShowRejectionModal(true)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm flex items-center gap-2 text-white"
              >
                <XCircle size={16} /> Reject
              </button>
            </>
          )}

          <button className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 text-white">
            <PhoneOff size={16} /> End Call
          </button>
        </div>
      )}

      {/* Video Section */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className={`absolute inset-0 ${joined ? "block" : "hidden"}`}
        />

        {!joined && (
          <div className="flex h-full items-center justify-center px-4 py-10">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Camera Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-10 text-center">
                <video
                  ref={previewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-[300px] sm:h-[400px] object-cover"
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <VideoOff size={40} />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-8 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Secure Video KYC
                </h1>

                <div className="flex justify-center lg:justify-start gap-6">
                  <button
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                      isCameraOn
                        ? "bg-white text-black"
                        : "bg-white/10 border border-white/20"
                    }`}
                    onClick={toggleCamera}
                  >
                    {isCameraOn ? <Video /> : <VideoOff />}
                  </button>

                  <button
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                      isMicOn
                        ? "bg-white text-black"
                        : "bg-white/10 border border-white/20"
                    }`}
                    onClick={toggleMic}
                  >
                    {isMicOn ? <Mic /> : <MicOff />}
                  </button>
                </div>

                <button
                  onClick={startCall}
                  className="w-full bg-white text-black py-4 rounded-xl font-semibold"
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Join Secure Call"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <button
                className="absolute top-4 right-4 text-gray-400"
                onClick={() => setShowApprovalModal(false)}
              >
                <X size={16} />
              </button>

              <h2 className="text-lg font-semibold mb-4 text-white">
                Confirm Approval
              </h2>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 border rounded-xl py-2"
                >
                  Cancel
                </button>
                <button
                  disabled={aLoading}
                  onClick={handleApprove}
                  className="flex-1 border rounded-xl py-2 bg-green-600"
                >
                  {aLoading ? "Approving..." : "Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <button
                className="absolute top-4 right-4 text-gray-400"
                onClick={() => setShowRejectionModal(false)}
              >
                <X size={16} />
              </button>

              <h2 className="text-lg font-semibold mb-4 text-white">
                Reject Partner
              </h2>

              <textarea
                placeholder="Give Rejection reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 mb-4 text-sm"
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 border rounded-xl py-2"
                >
                  Cancel
                </button>
                <button
                  disabled={rLoading}
                  onClick={handleReject}
                  className="flex-1 border rounded-xl py-2 bg-red-600"
                >
                  {rLoading ? "Processing..." : "Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Page;