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

type Step = {
  id: number;
  title: string;
  route?: string;
};

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

  /**
   * Fetch logged-in partner details
   */
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/me");
      dispatch(setUserData(data));
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  /**
   * Initial load + polling for real-time updates
   */
  useEffect(() => {
    fetchUser();
    const interval = setInterval(fetchUser, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  /**
   * Set active onboarding step
   */
  useEffect(() => {
    if (userData) {
      setActiveStep(userData.partnerOnBoardingSteps ?? 0);
    }
  }, [userData]);

  /**
   * Fetch pricing data
   */
  const handleGetPricing = async () => {
    try {
      const { data } = await axios.get(
        "/api/partner/onboarding/pricing"
      );
      setVehicleData(data);
    } catch (error) {
      console.error("Error fetching pricing:", error);
    }
  };

  useEffect(() => {
    handleGetPricing();
  }, []);

  /**
   * Navigation between steps
   */
  const goToStep = (step: Step) => {
    if (
      step.id === 6 &&
      userData?.partnerStatus === "approved" &&
      userData?.videoKycStatus === "approved"
    ) {
      setShowPricing(true);
      return;
    }

    if (step.route && step.id <= activeStep) {
      router.push(step.route);
    }
  };

  const progressPercentage =
    TOTAL_STEPS > 1
      ? (activeStep / (TOTAL_STEPS - 1)) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 pt-28 pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">
            Partner Onboarding Status
          </h1>
          <p className="text-gray-600 mt-3">
            Track your progress through the partner onboarding process.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto">
          <div className="relative min-w-[800px]">
            <div className="absolute top-7 left-0 w-full h-[3px] bg-gray-200 rounded-full">
              <motion.div
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6 }}
                className="absolute top-0 left-0 h-[3px] bg-black rounded-full"
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

        {/* Step 4: Partner Review Status */}
        {activeStep === 4 && userData?.partnerStatus === "rejected" && (
          <RejectionCard
            title="Partner Rejected"
            reason={userData.rejectionReason}
            actionLabel="Review and Update"
            onAction={() =>
              router.push("/partner/onboarding/vehicle")
            }
          />
        )}

        {activeStep === 4 && userData?.partnerStatus === "pending" && (
          <StatusCard
            icon={<Clock size={18} />}
            title="Under Review"
            desc="Admin is verifying your documents. Please wait for approval."
          />
        )}

        {/* Step 5: Video KYC */}
        {(activeStep === 5 ||
  userData?.videoKycStatus === "in_progress" ||
  userData?.videoKycStatus === "approved" ||
  userData?.videoKycStatus === "rejected") && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            {!userData?.videoKycStatus && (
              <StatusCard
                icon={<Clock size={18} />}
                title="Video KYC Pending"
                desc="Please wait for the admin to initiate your Video KYC."
              />
            )}

            {userData?.videoKycStatus === "pending" && (
              <StatusCard
                icon={<Clock size={18} />}
                title="Waiting for Admin"
                desc="Your Video KYC request has been submitted."
              />
            )}

            {userData?.videoKycStatus === "in_progress" &&
              userData?.videoKycRoomId && (
                <ActionCard
                  icon={<Video size={18} />}
                  title="Admin started Video KYC"
                  button="Join Room"
                  onClick={() =>
                    router.push(
                      `/video-kyc/${userData.videoKycRoomId}`
                    )
                  }
                />
              )}

            {userData?.videoKycStatus === "approved" && (
              <StatusCard
                icon={<Check size={18} />}
                title="Video KYC Approved"
                desc="You can now proceed to pricing."
              />
            )}

            {userData?.videoKycStatus === "rejected" && (
              <RejectionCard
                title="Video KYC Rejected"
                reason={
                  userData?.videoKycRejectionReason ||
                  "Please request again."
                }
                actionLabel={
                  requestLoading ? "Requesting..." : "Request Again"
                }
                onAction={async () => {
                  try {
                    setRequestLoading(true);
                    await axios.get(
                      "/api/partner/video-kyc/request"
                    );
                    fetchUser();
                  } catch (error) {
                    console.error(
                      "Error requesting Video KYC:",
                      error
                    );
                  } finally {
                    setRequestLoading(false);
                  }
                }}
              />
            )}
          </div>
        )}

        {/* Step 7: Pricing Status */}
        {activeStep === 7 && vehicleData?.status === "pending" && (
          <StatusCard
            icon={<Clock size={20} />}
            title="Pricing Under Review"
            desc="Admin is reviewing your pricing."
          />
        )}

        {activeStep === 7 && vehicleData?.status === "rejected" && (
          <RejectionCard
            title="Pricing Rejected"
            reason={vehicleData.rejectionReason}
            actionLabel="Edit & Resubmit"
            onAction={() => setShowPricing(true)}
          />
        )}

        {/* Step 8: Live */}
        {activeStep === 8 && vehicleData?.status === "approved" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black text-white rounded-3xl p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold">🚀 You're Live</h2>
            <button className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
              Go to Bookings <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Pricing Modal */}
      <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
        data={vehicleData}
      />
    </div>
  );
};

export default PartnerDashboard;