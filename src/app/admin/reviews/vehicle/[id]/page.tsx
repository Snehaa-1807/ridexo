'use client'
import { IUser } from '@/app/models/user.model'
import { IVehicle, vehicleType } from '@/app/models/vehicle.model'
import axios from 'axios'
import { ArrowLeft, CheckCircle, CircleDashed, Clock, ImageIcon, IndianRupee, ShieldCheck, Truck, XCircle } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import {AnimatePresence, motion} from 'motion/react'
import AnimatedCard from '@/components/AnimatedCard'
import { useEffect } from 'react'
 interface IVehicle {
  owner: IUser;
  type: vehicleType;
  number: string;
  vehicleModel: string;
  imageUrl?: string;
  baseFare?: number;
  pricePerKM: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
function page() {
    const {id}=useParams()
    const [data,setData]=useState<IVehicle>()
const router=useRouter()
const[showApprove,setShowApprove]=useState(false)
const[showReject,setShowReject]=useState(false)
 const [rejectReason, setRejectReason] = useState('')
const [approvedLoading, setApprovedLoading] = useState(false)
const [rejectLoading, setRejectLoading] = useState(false)
const[loading,setLoading]=useState(false)

    useEffect(()=>{
      const load=async()=>{
        try {
            const result=await axios.get(`/api/admin/reviews/vehicle/${id}`)
            setData(result.data)
        } catch (error) {
            
        }console.log(error.response.data.message ?? error)
      }  
    },[id])

    if(loading){
  return(
    <div className='min-h-screengrid place-items-center text-gray-500'>
      Loading Partner....
    </div>

  )
}

      const handleApprove = async () => {
    setApprovedLoading(true);
    try {
      const {data} = await axios.get(`/api/admin/reviews/vehicle/${id}/approve`, { withCredentials: true })
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
        `/api/admin/reviews/vehicle/${id}/reject`,
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
    <div className='min-h-screen bg-gray-50'>
  <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1">
            <div className="font-semibold text-lg">{data?.owner?.name}</div>
            <div className="text-xs text-gray-500">{data?.owner?.email}</div>
          </div>

          {data?.status === "approved" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 bg-green-100 text-green-700">
              <CheckCircle size={14} />
              Approved
            </div>
          ) : data?.status === "rejected" ? (
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
    <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-3xl overflow-hidden shadow-xl bg-white"
  >
    {data?.imageUrl && (
      <img
        src={data.imageUrl}
        alt="vehicle"
        className="w-full h-[450px] object-cover"
      />
    ):(
        <div className='h-[450px] grid place-items-center text-gray-300'>
            <ImageIcon size={25}/>

        </div>
    )}
  </motion.div>
  <div className='space-y-8'>
<AnimatedCard title={"Vehicle Details"} icon={<Truck size={18}/>}>
<div className='flex justify-between text-sm'>
    <span className='text-gray-500'>Vehicle Type</span>
    <span className='font-semibold'>{data?.type || "-"}</span>
</div>
 <div className="flex justify-between">
      <span className="text-gray-500">Vehicle Number</span>
      <span className="font-semibold">{data?.number || "-"}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Model</span>
      <span className="font-semibold">{data?.vehicleModel || "-"}</span>
    </div>
</AnimatedCard>
<AnimatedCard title={"Pricing Configuration"} icon={<IndianRupee size={18}/>}>
<div className='flex justify-between text-sm'>
    <span className='text-gray-500'>Base Fare</span>
    <span className='font-semibold items-center '><IndianRupee size={13}/>{data?.baseFare || 0}</span>
</div>
 <div className="flex justify-between">
      <span className="text-gray-500">Price Per KM</span>
      <span className='font-semibold items-center g'><IndianRupee size={13}/>{data?.pricePerKM || 0}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Waiting Charge</span>
      <span className="font-semibold flex items-center "><IndianRupee size={13}/>{data?.waitingCharge || 0}</span>
    </div>
</AnimatedCard>
    {data?.status === "pending" && (
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
<AnimatePresence>
  {showApprove && (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <motion.div className="bg-white p-6 rounded-xl w-full max-w-sm">
        
        <h2 className="text-lg font-bold">Approve Vehicle?</h2>

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
        
        <h2 className="text-lg font-bold">Reject Vehicle?</h2>

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

export default page