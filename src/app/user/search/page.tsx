'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Bike, Car, Truck, MapPin, Navigation, Zap, Search, RefreshCcw } from 'lucide-react'
import SearchMap from '@/components/SearchMap'
import axios from 'axios'
import VehicleCard from '@/components/VehicleCard'

const VEHICLE_META: any = {
  bike: { label: "Bike", Icon: Bike },
  auto: { label: "Auto", Icon: Car },
  car: { label: "Car", Icon: Car },
  loading: { label: "Loading", Icon: Truck },
  truck: { label: "Truck", Icon: Truck },
};
interface IVehicle {
  _id:string,
  owner: string,
  type: vehicleType,
  vehicleModel: string,
  number: string,
  imageUrl?: string,
  baseFare?: number,
  pricePerKM?: number,
  waitingCharge?: number,
  status: "approved" | "pending" | "rejected",
  rejectionReason?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
function Page() {
  const router = useRouter()
  const params = useSearchParams()

  const [pickUp, setPickUp] = useState(params.get("pickup") || "")
  const [drop, setDrop] = useState(params.get("drop") || "")
  const mobile = params.get("mobile")

  const [km, setKm] = useState<number>(0)

  const pickUpLat = Number(params.get("pickuplat"))
  const pickUpLon = Number(params.get("pickuplon"))
  const dropLat = Number(params.get("droplat"))
  const dropLon = Number(params.get("droplon"))

  const vehicle = params.get("vehicle") || ""

  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const meta = VEHICLE_META[vehicle]

  const getNearByVehicles = async (latitude: number, longitude: number, vehicleType: string) => {
    setLoading(true)
    try {
      const { data } = await axios.post("/api/vehicles/near-by", {
        latitude, longitude, vehicleType
      })
      setVehicles(data)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  // ✅ FIXED
  useEffect(() => {
    if (!pickUpLat || !pickUpLon || !vehicle) return
    if (isNaN(pickUpLat) || isNaN(pickUpLon)) return

    getNearByVehicles(pickUpLat, pickUpLon, vehicle)

  }, [pickUpLat, pickUpLon, vehicle])

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden">

      {/* BACK BUTTON */}
      <div className="absolute top-5 left-5 z-50">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft size={17} className="text-zinc-900" />
        </motion.button>
      </div>

      {/* MAP */}
      <div className='relative w-full h-[52vh] z-0'>
        <SearchMap
          pickUp={pickUp}
          drop={drop}
          onChange={(p, d) => { setPickUp(p); setDrop(d) }}
          onDistance={setKm}
        />
      </div>

      {/* BOTTOM PANEL */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="relative z-20 -mt-10 bg-white rounded-t-[28px] border-t border-zinc-200 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] pt-5 pb-20 min-h-[52vh]"
      >

        <div className='px-5 lg:px-8 max-w-6xl mx-auto'>

          {/* LOCATION CARD */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden mb-5"
          >
            {/* PICKUP */}
            <div className='flex gap-3 px-4 py-3 border-b border-zinc-100'>
              <div className='flex flex-col items-center pt-1.5 flex-shrink-0'>
                <div className='w-2.5 h-2.5 rounded-full bg-zinc-900' />
                <div className="w-px flex-1 bg-zinc-300 my-1" style={{ minHeight: 14 }} />
              </div>

              <div className='flex-1 min-w-0'>
                <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Pickup</p>
                <p className='text-sm text-zinc-900 font-semibold truncate'>{pickUp || "-"}</p>
              </div>

              <MapPin size={14} className="text-zinc-400 mt-1.5" />
            </div>

            {/* DROP */}
            <div className='flex gap-3 px-4 py-3 border-b border-zinc-100'>
              <div className='flex flex-col items-center pt-1.5 flex-shrink-0'>
                <div className='w-2.5 h-2.5 rounded-full bg-zinc-900' />
              </div>

              <div className='flex-1 min-w-0'>
                <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Drop</p>
                <p className='text-sm text-zinc-900 font-semibold truncate'>{drop || "-"}</p>
              </div>

              <Navigation size={14} className="text-zinc-400 mt-1.5" />
            </div>
          </motion.div>

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-4"
          >
            <div>
              <h2 className='text-zinc-900 text-lg font-black'>
                {loading ? "Finding Vehicles" : vehicles?.length > 0 ? "Available" : "No Nearby Vehicle"}
              </h2>

              {meta && (
                <div className='text-zinc-400 text-xs mt-0.5'>
                  {meta.label} rides near your pickup
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="searching" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-2 bg-zinc-100 border px-3 py-1.5 rounded-full">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />
                  <span>Searching...</span>
                </motion.div>
              ) : vehicles.length > 0 ? (
                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className='flex items-center gap-1.5 bg-emerald-50 border px-3 py-1.5 rounded-full'>
                  <Zap size={11} className='text-emerald-600 fill-emerald-600' />
                  <span className='text-emerald-700 text-xs font-bold'>Live</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          {/* EMPTY STATE */}
          <AnimatePresence>
            {!loading && vehicles?.length === 0 && (
              <motion.div className="flex flex-col items-center py-14 text-center">
                <Search size={26} className='text-zinc-400 mb-4' />
                <p className="text-sm font-bold mb-1">No nearby vehicles found</p>

                <p className='text-zinc-400 text-sm'>
                  {(meta?.label || "Vehicle")} drivers are not available right now.
                </p>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!pickUpLat || !pickUpLon || !vehicle) return
                    getNearByVehicles(pickUpLat, pickUpLon, vehicle)
                  }}
                  className='mt-5 bg-zinc-900 text-white px-6 py-2.5 rounded-xl'
                >
                  Retry Search
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VEHICLES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehicles?.map((v, i) => (
              <motion.div key={i}>
                <VehicleCard
                  vehicle={v}
                  distance={km}
                  onBook={() => {
                    const fare = (v.baseFare || 0) + ((v.pricePerKm || 0) * (km || 0))

                    const url = new URLSearchParams({
                      pickUp,
                      drop,
                      vehicle: v.type,
                      driverId: v.owner,
         vehicleId: String(v._id),
                      fare: String(Math.round(v.baseFare! + (v.pricePerKm! *km))),
                      pickUpLat: String(pickUpLat),
                      pickUpLon: String(pickUpLon),
                      dropLat: String(dropLat),
                      dropLon: String(dropLon),
                      mobile: String(mobile),
                    })

                    router.push(`/user/checkout?${url.toString()}`)
                  }}
                />
              </motion.div>
            ))}
          </div>

        </div>
      </motion.div>
    </div>
  )
}

export default Page