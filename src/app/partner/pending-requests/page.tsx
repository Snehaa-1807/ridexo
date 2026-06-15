'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Clock, IndianRupee, Loader2, MapPin, Navigation } from 'lucide-react'
import { BookingStatus, PaymentStatus } from '@/app/models/booking.model'
import { useRouter } from 'next/navigation'
import { getSocket } from '@/app/lib/socket'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

interface IBooking {
  _id: string
  user: string
  driver: string
  vehicle: string
  pickUpAddress: string
  dropAddress: string
  pickUpLocation: { type: "Point"; coordinates: [number, number] }
  dropLocation: { type: "Point"; coordinates: [number, number] }
  fare: number
  userMobileNumber: string
  driverMobileNumber: string
  bookingStatus: BookingStatus
  paymentStatus: PaymentStatus
  paymentDeadline: Date
  adminCommission: number
  partnerAmount: number
  pickUpOtp: string
  pickUpOtpExpires: Date
  dropOtp: string
  dropOtpExpires: Date
  createdAt?: Date
  updatedAt?: Date
}

export default function Page() {
  const [bookings, setBookings] = useState<IBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()
  const userData = useSelector((state: RootState) => state.user.userData)

 const fetchPendingRequests = async (isInitial = false) => {
  try {
    if (isInitial) setLoading(true)  // ← only show spinner on first load
    const { data } = await axios.get('/api/partner/bookings/pending')
    setBookings(Array.isArray(data) ? data : [])
  } catch (error) {
    console.log(error)
    setBookings([])
  } finally {
    if (isInitial) setLoading(false)
  }
}

  const handleAccept = async (id: string) => {
    try {
      setActionLoading(id)
      await axios.post(`/api/partner/bookings/${id}/accept`)
      await fetchPendingRequests()
      router.push('/partner/bookings')
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id)
      await axios.post(`/api/partner/bookings/${id}/reject`)
      await fetchPendingRequests()
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading(null)
    }
  }

  // Polling fallback — every 5 seconds
useEffect(() => {
  fetchPendingRequests(true)  // initial load — shows spinner

  // Poll every 5 seconds — no spinner flash
  const interval = setInterval(() => fetchPendingRequests(false), 5000)
  return () => clearInterval(interval)
}, [])

  // Emit identity so server knows this partner's socketId
  useEffect(() => {
    if (!userData?._id && !userData?.id) return

    const userId = userData._id ?? userData.id
    const socket = getSocket()

    const emitIdentity = () => {
      socket.emit("identity", userId)
      console.log("✅ pending-requests: identity emitted for:", userId)
    }

    if (socket.connected) {
      emitIdentity()
    }

    socket.on("connect", emitIdentity)

    return () => {
      socket.off("connect", emitIdentity)
    }
  }, [userData?._id, userData?.id])

  // Listen for new bookings via socket
  useEffect(() => {
    const socket = getSocket()

    console.log("Socket status:", socket.connected, socket.id)

    socket.on("new-booking", (data) => {
      console.log("✅ NEW BOOKING RECEIVED:", data)
      setBookings((prev) => {
        const exists = prev.find(b => b._id === data._id)
        if (exists) return prev
        return [data, ...prev]
      })
    })

    return () => {
      socket.off("new-booking")
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f4f5f7]">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-semibold text-gray-900">Ride Requests</h1>
          <p className="mt-3 text-lg text-gray-500">
            Manage incoming ride requests and respond in real time.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-gray-700" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <p className="text-lg text-gray-500">No pending ride requests.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b, i) => {
              const processing = actionLoading === b._id
              return (
                <motion.div
                  key={b._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                    {/* LEFT */}
                    <div className="flex-1 space-y-6">
                      <div className="flex gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-xs uppercase text-gray-400 mb-1">Pickup Location</p>
                          <p className="font-medium text-gray-900">{b.pickUpAddress}</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center">
                          <Navigation size={18} />
                        </div>
                        <div>
                          <p className="text-xs uppercase text-gray-400 mb-1">Drop Location</p>
                          <p className="font-medium text-gray-900">{b.dropAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span className="font-medium">
                          {b.createdAt
                            ? new Date(b.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--'}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col justify-between lg:items-end gap-6 w-full lg:w-auto">
                      <div className="text-left lg:text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                          Estimated Fare
                        </p>
                        <div className="flex items-center gap-2 text-3xl font-bold text-gray-900 lg:justify-end">
                          <IndianRupee size={20} />
                          {b.fare}
                        </div>
                      </div>

                      <div className="flex gap-4 w-full lg:w-auto">
                        <button
                          disabled={processing}
                          onClick={() => handleReject(b._id)}
                          className="flex-1 lg:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          {processing
                            ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            : 'Reject'}
                        </button>

                        <button
                          disabled={processing}
                          onClick={() => handleAccept(b._id)}
                          className="flex-1 lg:flex-none px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-900 transition disabled:opacity-50 flex items-center justify-center"
                        >
                          {processing
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : 'Accept Ride'}
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}