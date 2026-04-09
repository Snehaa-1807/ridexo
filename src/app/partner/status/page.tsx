"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RejectionCard from '@/components/RejectionCard';

type Step = {
  id: number,
  title: string,
  description: string,
  route?: string
}

const steps: Step[] = [
  { id: 1, title: "Vehicle Details", description: "Submit your vehicle information", route: "/partner/onboarding/vehicle" },
  { id: 2, title: "Documents", description: "Upload required documents", route: "/partner/onboarding/documents" },
  { id: 3, title: "Bank Details", description: "Provide banking information", route: "/partner/onboarding/bank" },
  { id: 4, title: "Review", description: "Application under review by admin" },
  { id: 5, title: "Video KYC", description: "Complete video verification" },
  { id: 6, title: "Pricing Setup", description: "Configure your pricing" },
  { id: 7, title: "Final Review", description: "Final approval process" },
  { id: 8, title: "Live", description: "Your account is now live!" },
];

const TOTAL_STEPS = steps.length;

const PartnerStatus = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { userData } = useSelector((state: RootState) => state.user);
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/");
      return;
    }

    if (userData) {
      setActiveStep(userData.partnerOnBoardingSteps ?? 0);
    }
  }, [userData, sessionStatus, router]);

  const isPartner = userData?.role === "partner";

  const goToStep = (step: Step) => {
    // Allow navigation to completed + current active step
    if (step.route && step.id <= activeStep + 1) {
      router.push(step.route);
    }
  };

  const progressPercentage = TOTAL_STEPS > 1 ? ((activeStep) / (TOTAL_STEPS - 1)) * 100 : 0;

  if (sessionStatus === "loading") {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 pt-28 pb-16">
      <Nav />

      <div className="w-full bg-white px-4 py-8">
        <div className="mb-8">
          {!isPartner && (
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Onboarding Status</h1>
          <p className="text-gray-600">Track your progress through the partner onboarding process</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 w-full max-w-350 mx-auto bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto">
          <div className="relative min-w-200">
            <div className="absolute top-7 left-0 w-full h-0.75 bg-gray-200 rounded-full" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="absolute top-7 left-0 h-0.75 bg-black rounded-full"
            />

            <div className="relative flex justify-between">
              {steps.map((step) => {
                const isCompleted = step.id <= activeStep;
                const isCurrent = step.id === activeStep + 1;
                const isLocked = step.id > activeStep + 1;

                let markerClass = "bg-gray-300 text-gray-400 border-gray-300";
                if (isCompleted) markerClass = "bg-black text-white border-black";
                else if (isCurrent) markerClass = "bg-white text-black border-black";

                let markerContent: React.ReactNode = <span>{step.id}</span>;
                if (isCompleted) markerContent = <Check size={20} />;
                else if (isLocked) markerContent = <Lock size={20} />;

                return (
                  <motion.div
                    key={step.id}
                    whileHover={isLocked ? undefined : { scale: 1.05 }}
                    onClick={() => goToStep(step)}
                    className="flex flex-col items-center z-10 cursor-pointer"
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${markerClass}`}>
                      {markerContent}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-center max-w-30 whitespace-normal">
                      {step.title}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        {userData?.partnerStatus === "rejected" && userData?.rejectionReason && (
          <RejectionCard reason={userData.rejectionReason} />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PartnerStatus;