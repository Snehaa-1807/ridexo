'use client'

import axios from 'axios'
import {
  ArrowLeft,
  Car,
  CheckCircle,
  Clock,
  Landmark,
  ShieldCheck,
  XCircle,
  FileText,
  CircleDashed
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { IUser } from '@/app/models/user.model'
import { IVehicle } from '@/app/models/vehicle.model'
import { IPartnerDocs } from '@/app/models/partnerDocs.model'
import { IPartnerBank } from '@/app/models/partnerBank.models'
import AnimatedCard from '@/components/AnimatedCard'
import DocPreview from '@/components/DocPreview'
import { AnimatePresence, motion } from 'framer-motion'

function Page() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  const [data, setData] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [vehicleDetails, setVehicleDetails] = useState<IVehicle | null>(null)
  const [partnerDocs, setPartnerDocs] = useState<IPartnerDocs | null>(null)
  const [partnerBank, setPartnerBank] = useState<IPartnerBank | null>(null)
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
const [approvedLoading, setApprovedLoading] = useState(false)
const [rejectLoading, setRejectLoading] = useState(false)
  const handleGetPartner = async () => {
    try {
      const res = await axios.get(`/api/admin/reviews/partner/${id}`, { withCredentials: true })
      setData(res.data.partner)
      setVehicleDetails(res.data.vehicle)
      setPartnerDocs(res.data.documents)
      setPartnerBank(res.data.bank)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) handleGetPartner()
  }, [id])

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("Not authenticated, redirecting to home");
      router.push("/");
      return;
    }

    if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      console.log("Not admin, redirecting to home");
      router.push("/");
      return;
    }
  }, [status, session, router])

  if (loading) {
    return (
      <div className='min-h-screen grid place-items-center text-gray-500'>
        Loading Partner...
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className='min-h-screen grid place-items-center text-gray-500'>
        Verifying access...
      </div>
    )
  }

  if (status === "unauthenticated" || (session?.user as any)?.role !== "admin") {
    return (
      <div className='min-h-screen grid place-items-center text-gray-500'>
        Unauthorized
      </div>
    )
  }

  const handleApprove = async () => {
    setApprovedLoading(true);
    try {
      const {data} = await axios.get(`/api/admin/reviews/partner/${id}/approve`, { withCredentials: true })
      console.log(data)
      setApprovedLoading(false);
      router.push("/")
    } catch (error) {
      console.log(error)
      setApprovedLoading(false);
    }
  }

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      const res = await axios.post(
        `/api/admin/reviews/partner/${id}/reject`,
        { rejectionReason: rejectReason },
        { withCredentials: true }
      )
      console.log(res.data)
      setRejectLoading(false);
            router.push("/")

    } catch (error) {
      console.log(error)
      setRejectLoading(false);

    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1">
            <div className="font-semibold text-lg">{data?.name}</div>
            <div className="text-xs text-gray-500">{data?.email}</div>
          </div>

          {data?.partnerStatus === "approved" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 bg-green-100 text-green-700">
              <CheckCircle size={14} />
              Approved
            </div>
          ) : data?.partnerStatus === "rejected" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 bg-red-100 text-red-700">
              <XCircle size={14} />
              Rejected
            </div>
          ) : (
            <div className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 bg-yellow-100 text-yellow-700">
              <Clock size={14} />
              Pending
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
        <AnimatedCard title="Vehicle Details" icon={<Car size={18} />}>
  <div className="space-y-2 text-sm">

    <div className="flex justify-between">
      <span className="text-gray-500">Vehicle Type</span>
      <span className="font-semibold">{vehicleDetails?.type || "-"}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Vehicle Number</span>
      <span className="font-semibold">{vehicleDetails?.number || "-"}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Model</span>
      <span className="font-semibold">{vehicleDetails?.vehicleModel || "-"}</span>
    </div>

  </div>
</AnimatedCard>

          <AnimatedCard title="Documents" icon={<FileText size={18} />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DocPreview label="Aadhaar" url={partnerDocs?.aadharUrl} />
              <DocPreview label="Registration Certificate" url={partnerDocs?.rcUrl} />
              <DocPreview label="Driving License" url={partnerDocs?.licenseUrl} />
            </div>
          </AnimatedCard>
        </div>

        {/* Right */}
        <div className="space-y-8">
         <AnimatedCard title="Bank Details" icon={<Landmark size={18} />}>
  <div className="space-y-2 text-sm">

    <div className="flex justify-between">
      <span className="text-gray-500">Account Holder</span>
      <span className="font-semibold">{partnerBank?.accountHolder || "-"}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Account Number</span>
      <span className="font-semibold">{partnerBank?.accountNumber || "-"}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">IFSC</span>
      <span className="font-semibold">{partnerBank?.ifsc || "-"}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Mobile</span>
<span>{data?.mobileNumber || "-"}</span>    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">UPI</span>
      <span className="font-semibold">{partnerBank?.upi || "-"}</span>
    </div>

  </div>
</AnimatedCard>

          {data?.partnerStatus === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} />
                Admin Check
              </div>

              <p className="text-sm text-gray-500">
                Verify documents carefully before approving.
              </p>

              <div className="flex flex-col gap-4">
                <button
                  className="py-3 rounded-2xl bg-black text-white"
                  onClick={() => setShowApprove(true)}
                >
                  Approve
                </button>

                <button
                  className="py-3 rounded-2xl border"
                  onClick={() => setShowReject(true)}
                >
                  Reject
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Approve Modal */}
<AnimatePresence>
  {showApprove && (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <motion.div className="bg-white p-6 rounded-xl w-full max-w-sm">
        
        <h2 className="text-lg font-bold">Approve Partner?</h2>

        <p className="text-sm text-gray-500 mt-2">
          Confirm all information has been verified.
        </p>

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 py-2 rounded-xl border"
            onClick={() => setShowApprove(false)}
          >
            Cancel
          </button>

          <button
            className=" flex-1 flex py-2  rounded-xl bg-black text-white flex items-center justify-center"
            onClick={handleApprove}
            disabled={approvedLoading}
          >
            {approvedLoading ? (
              <CircleDashed className="animate-spin" />
            ) : (
              "Yes, Approve"
            )}
          </button>
        </div>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Reject Modal */}
<AnimatePresence>
  {showReject && (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <motion.div className="bg-white p-6 rounded-xl w-full max-w-sm">
        
        <h2 className="text-lg font-bold">Reject Partner?</h2>

        <textarea
          placeholder="Enter rejection reason"
          className="w-full mt-3 border rounded-xl p-3 text-sm"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 py-2 rounded-xl border"
            onClick={() => setShowReject(false)}
          >
            Cancel
          </button>

          <button
            className="flex-1 flex py-2 rounded-xl bg-black text-white flex items-center justify-center"
            onClick={handleReject}
            disabled={rejectLoading}
          >
            {rejectLoading ? (
              <CircleDashed className="animate-spin" />
            ) : (
              "Reject"
            )}
          </button>
        </div>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  )
}

export default Page