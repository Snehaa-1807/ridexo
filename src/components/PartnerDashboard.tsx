'use client'

import { RootState } from '@/redux/store'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from "framer-motion"
import { Check, Clock, Lock, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RejectionCard from './RejectionCard'
import StatusCard from './StatusCard'
import ActionCard from './ActionCard'

type Step = {
  id: number,
  title: string,
  route?: string
}

const steps: Step[] = [
  { id: 1, title: "Vehicle", route: "/partner/onboarding/vehicle" },
  { id: 2, title: "Documents", route: "/partner/onboarding/documents" },
  { id: 3, title: "Bank", route: "/partner/onboarding/bank" },
  { id: 4, title: "Review" },
  { id: 5, title: "Video KYC" },
  { id: 6, title: "Pricing" },
  { id: 7, title: "Final Review" },
  { id: 8, title: "Live" },
]

const TOTAL_STEPS = steps.length;

const PartnerDashboard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { userData } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (userData) {
setActiveStep(userData.partnerOnBoardingSteps ?? 0)    }
  }, [userData]);

 const goToStep = (step: Step) => {
  // allow navigation to completed + current active step
  if (step.route && step.id <= activeStep + 1) {
    router.push(step.route)
  }
}

  const progressPercentage =
    TOTAL_STEPS > 1
      ? ((activeStep) / (TOTAL_STEPS - 1)) * 100
      : 0; // ✅ FIXED (prevent divide by 0)
console.log("Active Step:", activeStep);
console.log("Video KYC Status:", userData?.videoKycStatus);
console.log("Video KYC Room ID:", userData?.videoKycRoomId);
console.log("User Data:", userData);
  return (
    <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-28 pb-20'>
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h1 className='text-4xl font-bold'>Partner Onboarding</h1>
          <p className='text-gray-600 mt-3'>Complete the steps below to get started.</p>
        </div>

        <div className='bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto'>
          <div className='relative min-w-[800px]'>

            <div className='absolute top-7 left-0 w-full h-[3px] bg-gray-200 rounded-full'>
              <motion.div
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6 }}
                className='absolute top-0 left-0 h-[3px] bg-black rounded-full'
              />
            </div>

            <div className='relative flex justify-between'>
              {steps.map((s) => {
                 const completed = s.id <= activeStep
  const active = s.id === activeStep + 1
  const locked = s.id > activeStep + 1

                return (
                  <motion.div
                    key={s.id}
                    whileHover={!locked ? { scale: 1.1 } : undefined} // ✅ FIXED
                    onClick={() => goToStep(s)}
                    className='flex flex-col items-center z-10 cursor-pointer'
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                        completed
                          ? "bg-black text-white border-black"
                          : active
                          ? "border-black bg-white"
                          : "bg-gray-300 text-gray-400"
                      }`}
                    >
                      {
                        completed ? (
                          <Check size={20} />
                        ) : locked ? (
                          <Lock size={20} />
                        ) : (
                          <span>{s.id}</span> // ✅ FIXED (valid JSX)
                        )
                      }
                    </div>

                    <p className='mt-3 text-sm font-semibold text-center'>{s.title}</p>
                  </motion.div>
                )
              })}
            </div>

          </div>
        </div>

{
          activeStep ==4 && userData?.partnerStatus === "rejected" &&(
            <RejectionCard
  title="Partner Rejected"
  reason={userData.rejectionReason}
  actionLabel={" Review and Update "}
  onAction={() => {
    router.push("/partner/onboarding/vehicle")
  }}
/>
          )
}  

{
            activeStep ==4 && userData?.partnerStatus === "pending" &&(
              <StatusCard
              icon={<Clock size={18} />}
              title={"Under Review"}
              desc={"Admin is verifying your documents. Please wait for approval."}
              />

)}
{activeStep ==5 && (
  
    userData?.videoKycStatus === "approved" ? (
      <StatusCard
        icon={<Check size={18} />}
        title={"Video KYC Approved"}
        desc={"You can now proceed to pricing."}
      />
    ) : userData?.videoKycStatus === "rejected" ? (
      <RejectionCard
        title="Video KYC Rejected"
        reason={userData?.videoKycRejectionReason}
        actionLabel="Request Again"
        onAction={() => router.push("/partner/onboarding/review")}
      />
    ) : userData?.videoKycStatus === "in_progress" &&
      userData?.videoKycRoomId ? (
      <ActionCard
        icon={<Video size={18} />}
        title={"Admin started Video KYC"}
        button={"Join Room"}
        onClick={() =>
          router.push(`/video-kyc/${userData.videoKycRoomId}`)
        }
      />
    ) : (
      <StatusCard
        icon={<Clock size={18} />}
        title={"Waiting for admin"}
        desc={"Please wait for the admin to start your Video KYC session."}
      />
    )
  )
}

  
      </div>
    </div>
  )
}

export default PartnerDashboard