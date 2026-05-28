'use client';
import axios from "node_modules/axios/index.cjs";
import React, { useEffect, useState } from "react";
import { IBooking } from "../bookings/page";
import LiveRideMap from "@/components/LiveRideMap";
import { motion } from "motion/react";
const MAP_STATUS: Record<
  BookingStatus,
  "arriving" | "ongoing" | "completed"
> = {
    idle: "arriving",
  requested: "arriving",
  awaiting_payment: "arriving",
  confirmed: "arriving",
  started: "ongoing",
  completed: "completed",
  cancelled: "completed",
  rejected: "completed",
  expired: "completed",
};
const STATUS_LABEL: Record<
  BookingStatus,
  {
    label: string;
    sublabel: string;
    dot: string;
  }
> = {

  idle: {
    label: "Awaiting Confirmation",
    sublabel: "Booking is being processed",
    dot: "bg-amber-400"
  },
requested: {
    label: "Awaiting Confirmation",
    sublabel: "Booking is being processed",
    dot: "bg-amber-400"
  },

  awaiting_payment: {
    label: "Payment Pending",
    sublabel: "Customer payment is pending",
    dot: "bg-purple-400"
  },

  confirmed: {
    label: "Heading to Pickup",
    sublabel: "Drive to the pickup location",
    dot: "bg-amber-400"
  },

  started: {
    label: "Ride in Progress",
    sublabel: "Heading to drop location",
    dot: "bg-emerald-400"
  },

  completed: {
    label: "Ride Completed",
    sublabel: "Trip has ended successfully",
    dot: "bg-zinc-400"
  },

  cancelled: {
    label: "Ride Cancelled",
    sublabel: "This ride was cancelled",
    dot: "bg-red-400"
  },

  rejected: {
    label: "Ride Rejected",
    sublabel: "Ride was rejected",
    dot: "bg-red-400"
  },

  expired: {
    label: "Request Expired",
    sublabel: "Booking timed out",
    dot: "bg-orange-400"
  }

};
function page() {
const [booking, setBooking] = useState<IBooking | null>(null)
const [loading, setLoading] = useState(true)

const [driverPos, setDriverPos] = useState<[Number, Number] | null>(null)

const [pickUpPos, setPickUpPos] = useState<[Number, Number] | null>(null)

const [dropPos, setDropPos] = useState<[Number, Number] | null>(null)
  useEffect(() => {

    async function fetch() {
setLoading(true)
      try {

        const { data } = await axios.get(
          "/api/partner/my-active-ride"
        )

        console.log(data)
        setBooking(data)
        setPickUpPos([data.pickUpLocation.coordinates[1], data.pickUpLocation.coordinates[0]])
        setDropPos([data.dropLocation.coordinates[1], data.dropLocation.coordinates[0]])

        setLoading(false)

      } catch (error: any) {

        console.log(error.response.data.message)
        setLoading(false)

      }

    }

    fetch()

  }, [])

useEffect(() => {

  if (!navigator.geolocation) return;

  const watchId = navigator.geolocation.watchPosition(

    (pos) => {

      const lat = pos.coords.latitude
      const lon = pos.coords.longitude

      setDriverPos([lat, lon])

    },

    (error) => {
      console.log("gps error", error)
    },

    {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 10000
    }

  )

  return () => {
    navigator.geolocation.clearWatch(watchId)
  }

}, [])
if(loading){
    return (

  <div className='h-screen w-full bg-zinc-950 flex items-center justify-center'>

    <div className='flex flex-col items-center gap-4'>

      <div className='w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin' />

      <p className='text-white/40 text-sm tracking-widest uppercase font-medium'>
        Loading Ride...
      </p>

    </div>

  </div>

)
}
const cfg=STATUS_LABEL[booking?.bookingStatus!?? "confirmed"]
  return (

    <div className='h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden'>
<div className='relative flex-1 h-full z-0'>
        <LiveRideMap
          driverLocation={driverPos}
          pickUpLocation={pickUpPos}
          dropLocation={dropPos}
          mapStatus={MAP_STATUS[booking?.bookingStatus!]}
        />
        <motion.div
  initial={{ opacity: 0, y: -16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3, duration: 0.5 }}
  className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-none"
>
<div className='flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-zinc-100'>

  <span
    className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`}
  />

  <span className='text-xs font-semibold tracking-wide text-zinc-900'>
    {cfg.label}
  </span>

</div>
</motion.div>
</div>
<motion.div
  initial={{ x: 60, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
  className="hidden lg:flex w-[420px] xl:w-[460px] bg-white border-l border-zinc-100 flex-col overflow-hidden"
>

  <div className='bg-zinc-950 px-6 py-5 flex-shrink-0'>

    <p className='text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1'>
      Driver Panel
    </p>

    <div className='flex items-center justify-between'>

      <h1></h1>

      <div></div>

    </div>

  </div>

</motion.div>
    </div>

  )

}