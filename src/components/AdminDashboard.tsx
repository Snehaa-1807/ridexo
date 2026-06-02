'use client'

import { CheckCircle2, Clock, Truck, Users, Video, XCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Kpi from './Kpi'
import TabButton from './TabButton'
import { AnimatePresence, motion } from 'framer-motion'
import ContentList from './ContentList'
import Image from 'next/image'
import axios from 'axios'
import AdminEarning from './AdminEarning'

type Stats = {
  totalApprovedPartners: number;
  totalPendingPartners: number;
  totalRejectedPartners: number;
  totalPartners: number;
}

type Tab = "kyc" | "partner" | "vehicle"

type AdminDashboardProps = {
  stats: Stats
  partnerReviews: any[]
  partnerkyc: any[]
  vehicleReviews: any[]
}

const AdminDashboard = ({
  stats,
  partnerReviews,
  partnerkyc,
  vehicleReviews
}: AdminDashboardProps) => {

  const [activeTab, setActiveTab] = useState<Tab>('partner')
  const [pendingKyc, setPendingKyc] = useState<any[]>(partnerkyc ?? [])
  const [dashboardStats, setStats] = useState<Stats>(stats)
  const [pendingPartnerReviews, setPartnerReviews] = useState<any[]>(partnerReviews ?? [])
  const [pendingVehicleReviews, setVehicleReviews] = useState<any[]>(vehicleReviews ?? [])

  const handleGetData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard");
      setStats(data.stats);
      setPartnerReviews(data.pendingPartnerReviews ?? []);
      setVehicleReviews(data.pendingVehicles ?? []);
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    }
  };

  const handleGetPendingKyc = async () => {
    try {
      const { data } = await axios.get("/api/admin/video-kyc/pending");
      setPendingKyc(data ?? []);
    } catch (error) {
      console.log("Error fetching pending KYC:", error);
    }
  };

  useEffect(() => {
    handleGetData();
    handleGetPendingKyc();
    const interval = setInterval(() => {
      handleGetData();
      handleGetPendingKyc();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200'>
      <div className='sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40'>
        <div className='max-w-7xl mx-auto h-16 px-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Image src="/logo.png" alt="logo" width={44} height={44} />
          </div>
          <div className='flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white'>
            <Users size={14} />
            Admin Dashboard
          </div>
        </div>
      </div>

      <main className='max-w-7xl mx-auto py-12 px-6 space-y-16'>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-6'>
          <Kpi label="Total Partners" value={dashboardStats?.totalPartners} icon={<Users />} variant="totalPartners" />
          <Kpi label="Total Approved Partners" value={dashboardStats?.totalApprovedPartners} icon={<CheckCircle2 />} variant="approved" />
          <Kpi label="Total Pending Partners" value={dashboardStats?.totalPendingPartners} icon={<Clock />} variant="pending" />
          <Kpi label="Total Rejected Partners" value={dashboardStats?.totalRejectedPartners} icon={<XCircle />} variant="rejected" />
        </div>

        <div className='bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2'>
          <TabButton active={activeTab === "partner"} count={pendingPartnerReviews?.length ?? 0} icon={<Users size={15} />} onClick={() => setActiveTab("partner")}>
            Partner Reviews
          </TabButton>
          <TabButton active={activeTab === "kyc"} count={pendingKyc?.length ?? 0} icon={<Video size={15} />} onClick={() => setActiveTab("kyc")}>
            KYC Reviews
          </TabButton>
          <TabButton active={activeTab === "vehicle"} count={pendingVehicleReviews?.length ?? 0} icon={<Truck size={15} />} onClick={() => setActiveTab("vehicle")}>
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
            {activeTab === "partner" && <ContentList data={pendingPartnerReviews} type="partner" />}
            {activeTab === "kyc" && <ContentList data={pendingKyc} type="kyc" />}
            {activeTab === "vehicle" && <ContentList data={pendingVehicleReviews} type="vehicle" />}
          </motion.div>
        </AnimatePresence>
              <AdminEarning/>

      </main>
    </div>
  )
}

export default AdminDashboard