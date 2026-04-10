'use client';

import { ArrowRight, CheckCircle2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface ContentListProps {
  data: any[];
  type: "partner" | "kyc" | "vehicle";
}

function ContentList({ data, type }: ContentListProps) {
  const router = useRouter();

  // ✅ Validate MongoDB ObjectId
  const isValidObjectId = (id: string) =>
    /^[a-fA-F0-9]{24}$/.test(id);

  // ✅ Start Video KYC
  const handleStartVideoKyc = async (id: string) => {
    if (!id || !isValidObjectId(id)) {
      console.error("Invalid Partner ID:", id);
      alert("Invalid Partner ID. Please refresh the page.");
      return;
    }

    try {
      console.log("Starting Video KYC for ID:", id);

      const result = await axios.get(
        `/api/admin/video-kyc/start/${id}`
      );

      const roomId = result?.data?.roomId;

      if (roomId) {
        router.push(`/admin/video-kyc/room/${roomId}`);
      } else {
        console.error("Room ID not received from API.");
      }
      window.location.reload();
    } catch (error: any) {
      console.error(
        "Error starting Video KYC:",
        error?.response?.data || error.message
      );
    }
  };

  // ✅ Join Existing Room
  const handleJoinRoom = (roomId: string) => {
    if (!roomId) {
      console.error("Room ID is missing.");
      return;
    }
    router.push(`/admin/video-kyc/room/${roomId}`);
  };

  // ✅ Empty State
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl py-16 text-center border border-dashed border-gray-200 shadow-sm"
      >
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={22} className="text-green-400" />
        </div>
        <p className="font-bold text-gray-800 text-base">All caught up!</p>
        <p className="text-gray-400 mt-1 text-sm">No pending items right now.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {type === "partner"
            ? "Partner Reviews Queue"
            : type === "kyc"
            ? "Pending Video KYC Queue"
            : "Vehicle Reviews Queue"}
        </p>
        <p className="text-xs text-gray-400">{data.length} items</p>
      </div>

      {/* List Items */}
      {data.map((item: any, index: number) => {
        const name = item?.name || "Unknown";
        const email = item?.email || "No Email";

        // ✅ Correct ID extraction
        const itemId =
          item?._id?.toString() ||
          item?.id?.toString() ||
          "";

        const roomId = item?.videoKycRoomId || "";
        const status = item?.videoKycStatus;

        console.log("Partner ID:", itemId);

        const reviewHref =
          type === "partner"
            ? `/admin/reviews/partner/${itemId}`
            : `/admin/reviews/vehicle/${itemId}`;

        return (
          <motion.div
            key={itemId || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{
              y: -3,
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            }}
            className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm transition-shadow"
          >
            {/* User Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
                {name?.charAt(0)?.toUpperCase() || (
                  <User size={16} />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  {name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {email}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="shrink-0">
              {/* Start Video KYC */}
              {type === "kyc" && status === "pending" && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={!isValidObjectId(itemId)}
                  onClick={() => handleStartVideoKyc(itemId)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 disabled:bg-gray-300 text-white text-sm font-semibold transition-colors"
                >
                  Start Video KYC <ArrowRight size={15} />
                </motion.button>
              )}

              {/* Join Room */}
              {type === "kyc" && status === "in_progress" && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push(`/video-kyc/${item.videoKycRoomId}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold transition-colors"
                >
                  Join Room <ArrowRight size={15} />
                </motion.button>
              )}

              {/* Review */}
              {(type === "partner" ||
                status === "approved" ||
                status === "rejected") && (
                <motion.button
                  type="button"
                  disabled={!isValidObjectId(itemId)}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push(reviewHref)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 disabled:bg-gray-300 text-white text-sm font-semibold transition-colors"
                >
                  Review <ArrowRight size={15} />
                </motion.button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ContentList;