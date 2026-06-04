"use client";

import { RootState } from "@/redux/store";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "@/redux/userSlice";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock, Lock, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import RejectionCard from "./RejectionCard";
import StatusCard from "./StatusCard";
import ActionCard from "./ActionCard";
import axios from "axios";
import PricingModal from "./PricingModal";
import { IVehicle } from "@/app/models/vehicle.model";
import PartnerEarning from "./PartnerEarning";

type Step = { id: number; title: string; route?: string };

const steps: Step[] = [
  { id: 1, title: "Vehicle", route: "/partner/onboarding/vehicle" },
  { id: 2, title: "Documents", route: "/partner/onboarding/documents" },
  { id: 3, title: "Bank", route: "/partner/onboarding/bank" },
  { id: 4, title: "Review" },
  { id: 5, title: "Video KYC" },
  { id: 6, title: "Pricing" },
  { id: 7, title: "Final Review" },
  { id: 8, title: "Live" },
];

const TOTAL_STEPS = steps.length;

const PartnerDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [vehicleData, setVehicleData] = useState<IVehicle | null>(null);
  const [requestLoading, setRequestLoading] = useState<boolean>(false);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/me", {
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      dispatch(setUserData(data));
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    fetchUser();
    const interval = setInterval(fetchUser, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (userData) setActiveStep(userData.partnerOnBoardingSteps ?? 0);
  }, [userData]);

  const fetchPricing = async () => {
    try {
      const { data } = await axios.get("/api/partner/onboarding/pricing");
      setVehicleData(data?.vehicle || data);
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error("Error fetching pricing:", error);
      }
    }
  };

  useEffect(() => { fetchPricing(); }, []);

  useEffect(() => {
    if (activeStep === 5 || activeStep === 6 || activeStep === 7) fetchPricing();
  }, [activeStep]);

  const goToStep = (step: Step) => {
    if (step.route && step.id <= activeStep) router.push(step.route);
  };

  const progressPercentage =
    TOTAL_STEPS > 1 ? (activeStep / (TOTAL_STEPS - 1)) * 100 : 0;

  const kycStatus = userData?.videoKycStatus;
  const showVideoKycSection =
    !!kycStatus &&
    kycStatus !== "not_required" &&
    !(kycStatus === "approved" && activeStep >= 5);

  const showDocReviewPending =
    activeStep === 4 &&
    userData?.partnerStatus === "pending" &&
    !showVideoKycSection;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 pt-28 pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h1 className="text-4xl font-bold">Partner Onboarding Status</h1>
          <p className="text-gray-600 mt-3">
            Track your progress through the partner onboarding process.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border overflow-hidden">
  <div className="relative w-full px-7">
    <div className="absolute inset-x-0 top-7 h-[3px] bg-gray-200 rounded-full">
      <motion.div
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.6 }}
        className="h-[3px] bg-black rounded-full"
      />
    </div>

    <div className="relative flex justify-between">
      {steps.map((s) => {
        const completed = s.id <= activeStep;
        const active = s.id === activeStep + 1;
        const locked = s.id > activeStep + 1;

        return (
          <motion.div
            key={s.id}
            whileHover={!locked ? { scale: 1.1 } : undefined}
            onClick={() => goToStep(s)}
            className="flex flex-col items-center z-10 cursor-pointer"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                completed
                  ? "bg-black text-white border-black"
                  : active
                  ? "border-black bg-white"
                  : "bg-gray-300 text-gray-400"
              }`}
            >
              {completed ? (
                <Check size={20} />
              ) : locked ? (
                <Lock size={20} />
              ) : (
                <span>{s.id}</span>
              )}
            </div>
            <p className="mt-3 text-sm font-semibold text-center">
              {s.title}
            </p>
          </motion.div>
        );
      })}
    </div>
  </div>
</div>

        {/* Step 0: Not started */}
        {activeStep === 0 && (
          <ActionCard
            icon={<ArrowRight size={18} />}
            title="Start your partner onboarding to get on the road"
            button="Start Now"
            onClick={() => router.push("/partner/onboarding/vehicle")}
          />
        )}

        {/* Steps 1–2: In progress */}
        {activeStep === 1 && (
          <ActionCard
            icon={<ArrowRight size={18} />}
            title="Vehicle added! Now upload your documents to continue."
            button="Upload Documents"
            onClick={() => router.push("/partner/onboarding/documents")}
          />
        )}

        {activeStep === 2 && (
          <ActionCard
            icon={<ArrowRight size={18} />}
            title="Documents uploaded! Now add your bank details."
            button="Add Bank Details"
            onClick={() => router.push("/partner/onboarding/bank")}
          />
        )}

        {activeStep === 3 && userData?.partnerStatus !== "rejected" && (
  <StatusCard
    icon={<Clock size={18} />}
    title="Almost there!"
    desc="Your application has been submitted and is awaiting admin review."
  />
)}
        {/* Step 4: Partner doc rejected — resubmit by fixing vehicle/docs/bank */}
        {activeStep === 3 && userData?.partnerStatus === "rejected" && (
          <RejectionCard
            title="Application Rejected"
            reason={userData.rejectionReason}
            actionLabel="Fix & Resubmit"
            onAction={() => router.push("/partner/onboarding/vehicle")}
          />
        )}

        {activeStep === 4 && userData?.partnerStatus === "rejected" && (
          <RejectionCard
            title="Application Rejected"
            reason={userData.rejectionReason}
            actionLabel="Fix & Resubmit"
            onAction={() => router.push("/partner/onboarding/vehicle")}
          />
        )}

        {/* Step 4: Waiting for doc review */}
        {showDocReviewPending && (
          <StatusCard
            icon={<Clock size={18} />}
            title="Under Review"
            desc="Admin is verifying your documents. Please wait for approval."
          />
        )}

        {/* Video KYC Section */}
        {showVideoKycSection && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            {kycStatus === "pending" && (
              <StatusCard
                icon={<Clock size={18} />}
                title="Waiting for Admin"
                desc="Your Video KYC request has been submitted. Admin will start the session shortly."
              />
            )}

            {kycStatus === "in_progress" && userData?.videoKycRoomId && (
              <ActionCard
                icon={<Video size={18} />}
                title="Admin has started your Video KYC session"
                button="Join Room"
                onClick={() => router.push(`/video-kyc/${userData.videoKycRoomId}`)}
              />
            )}

            {kycStatus === "in_progress" && !userData?.videoKycRoomId && (
              <StatusCard
                icon={<Clock size={18} />}
                title="Session Starting"
                desc="Admin is preparing your Video KYC session. Please wait..."
              />
            )}

            {/* Video KYC rejected — partner requests again */}
            {kycStatus === "rejected" && (
              <RejectionCard
                title="Video KYC Rejected"
                reason={userData?.videoKycRejectionReason || "Your Video KYC was not approved."}
                actionLabel={requestLoading ? "Requesting..." : "Request New KYC Session"}
                onAction={async () => {
                  try {
                    setRequestLoading(true);
                    await axios.get("/api/partner/video-kyc/request");
                    fetchUser();
                  } catch (error) {
                    console.error("Error requesting Video KYC:", error);
                  } finally {
                    setRequestLoading(false);
                  }
                }}
              />
            )}
          </div>
        )}

        {/* Step 5 + KYC approved: Setup Pricing */}
        {activeStep === 5 && kycStatus === "approved" && (
          <ActionCard
            icon={<ArrowRight size={18} />}
            title="Video KYC approved! Set up your pricing to continue."
            button="Setup Pricing"
            onClick={() => setShowPricing(true)}
          />
        )}

        {/* Step 6: Pricing under review */}
        {activeStep === 6 && vehicleData?.status === "pending" && (
          <StatusCard
            icon={<Clock size={20} />}
            title="Pricing Under Review"
            desc="Admin is reviewing your pricing and vehicle details."
          />
        )}

        {/* Step 6: Pricing rejected — resubmit pricing */}
        {activeStep === 6 && vehicleData?.status === "rejected" && (
          <RejectionCard
            title="Pricing / Vehicle Rejected"
            reason={vehicleData.rejectionReason}
            actionLabel="Update & Resubmit"
            onAction={() => setShowPricing(true)}
          />
        )}

        {/* Step 5: Pricing rejected rolled back */}
        {activeStep === 5 && kycStatus === "approved" && vehicleData?.status === "rejected" && (
          <RejectionCard
            title="Pricing / Vehicle Rejected"
            reason={vehicleData.rejectionReason}
            actionLabel="Update & Resubmit"
            onAction={() => setShowPricing(true)}
          />
        )}

        {/* Step 7: Final review */}
        {activeStep === 7 && (
          <StatusCard
            icon={<Clock size={20} />}
            title="Final Review"
            desc="Your application is under final review. You'll go live soon!"
          />
        )}

        {/* Step 8: LIVE */}
        {activeStep === 8 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black text-white rounded-3xl p-10 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-2xl">
                🚀
              </div>
              <div>
                <h2 className="text-2xl font-bold">You're Live!</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Your account is active. You can now receive bookings.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/partner/bookings")}
              className="mt-4 bg-white text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-100 transition"
            >
              Go to Bookings <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
        <PartnerEarning />
      </div>

      <PricingModal
        open={showPricing}
        onClose={() => {
          setShowPricing(false);
          fetchPricing();
          fetchUser();
        }}
        data={vehicleData}
      />
    </div>
  );
};

export default PartnerDashboard;