'use client'

import { CheckCircle2, Clock, Truck, Users, Video, XCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Kpi from './Kpi'
import TabButton from './TabButton'
import { AnimatePresence, motion } from 'framer-motion' // ✅ FIXED
import ContentList from './ContentList'
import Image from 'next/image' // ✅ FIXED (missing import)

type Stats = {
  totalApprovedPartners: number;
  totalPendingPartners: number;
  totalRejectedPartners: number;
  totalPartners: number;
}

type Tab = "kyc" | "partner" | "vehicle"

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('partner')
  const [partnerReviews, setPartnerReviews] = useState<any[]>([]) // ✅ FIXED
  const [partnerkyc, setPartnerkyc] = useState<any[]>([]) // ✅ FIXED
  const [vehicleReviews, setVehicleReviews] = useState<any[]>([]) // ✅ FIXED

  const handleGetData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard")
      setStats(data?.Stats) // ✅ FIXED (safe access)
      setPartnerReviews(data?.pendingPartnerReviews || []) // ✅ FIXED
      setPartnerkyc(data?.pendingKyc || []) // ✅ FIXED
      setVehicleReviews(data?.pendingVehicleReviews || []) // ✅ FIXED
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    handleGetData()
  }, [])

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200 '>
      <div className='sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40'>
        <div className='max-w-7xl mx-auto h-16 px-6 flex items-center justify-between'> {/* ✅ FIXED (tems → items) */}
          <div className='flex items-center gap-3'>
            <Image src="/logo.png" alt="logo" width={44} height={44} />
          </div>

          <div className='flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white'>
            <Users size={14} /> {/* ✅ FIXED (wrong User import removed) */}
            Admin Dashboard
          </div>
        </div>
      </div>

      <main className='max-w-7xl mx-auto py-12 px-6 space-y-16'>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-6'>
          <Kpi label="Total Partners" value={stats?.totalPartners} icon={<Users />} variant={"totalPartners"} />
          <Kpi label="Total Approved Partners" value={stats?.totalApprovedPartners} icon={<CheckCircle2 />} variant={"approved"} />
          <Kpi label="Total Pending Partners" value={stats?.totalPendingPartners} icon={<Clock />} variant={"pending"} />
          <Kpi label="Total Rejected Partners" value={stats?.totalRejectedPartners} icon={<XCircle />} variant={"rejected"} />
        </div>

        <div className='bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2'> {/* ✅ FIXED (shado-lg) */}
          <TabButton
            active={activeTab === "partner"}
            count={partnerReviews?.length ?? 0}
            icon={<Users size={15} />}
            onClick={() => setActiveTab("partner")}
          >
            Partner Reviews
          </TabButton>

          <TabButton
            active={activeTab === "kyc"}
            count={partnerkyc?.length ?? 0}
            icon={<Video size={15} />}
            onClick={() => setActiveTab("kyc")}
          >
            KYC Reviews
          </TabButton>

          <TabButton
            active={activeTab === "vehicle"}
            count={vehicleReviews?.length ?? 0}
            icon={<Truck size={15} />}
            onClick={() => setActiveTab("vehicle")}
          >
            Vehicle Reviews
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            {activeTab === "partner" && <ContentList data={partnerReviews} type={"partner"} />}
            {activeTab === "kyc" && <ContentList data={partnerkyc} type={"kyc"} />} {/* ✅ FIXED (pendingkyc → partnerkyc) */}
            {activeTab === "vehicle" && <ContentList data={vehicleReviews} type={"vehicle"} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default AdminDashboard