'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { MapPin, Navigation, RefreshCcw, Zap, Search, ArrowRight, Gauge, Clock, IndianRupee, Star, Bike, Car, Truck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SearchMap = dynamic(() => import('@/components/SearchMap'), { ssr: false })

type VehicleType = 'bike' | 'auto' | 'car' | 'loading' | 'truck'

const TYPE_CONFIG: Record<VehicleType, { label: string; Icon: React.ElementType }> = {
  bike:    { label: 'Bike',    Icon: Bike  },
  auto:    { label: 'Auto',    Icon: Car   },
  car:     { label: 'Car',     Icon: Car   },
  loading: { label: 'Loading', Icon: Truck },
  truck:   { label: 'Truck',   Icon: Truck },
}

interface IVehicle {
  _id: string
  owner: string
  type: VehicleType
  vehicleModel: string
  number: string
  imageUrl?: string
  baseFare?: number
  pricePerKM?: number
  waitingCharge?: number
  status: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function SearchPage() {
  const router = useRouter()
  const params = useSearchParams()

  const [pickUp, setPickUp] = useState(params.get('pickup') || '')
  const [drop,   setDrop  ] = useState(params.get('drop')   || '')
  const mobile = params.get('mobile') || ''

  const [pickUpLat, setPickUpLat] = useState(parseFloat(params.get('pickuplat') || '0'))
  const [pickUpLon, setPickUpLon] = useState(parseFloat(params.get('pickuplon') || '0'))
  const dropLat = parseFloat(params.get('droplat') || '0')
  const dropLon = parseFloat(params.get('droplon') || '0')

  const vehicleType = (params.get('vehicle') as VehicleType) || 'car'

  const [distance, setDistance] = useState<number>()
  const [vehicles, setVehicles] = useState<IVehicle[]>([])
  const [loading,  setLoading ] = useState(false)
  const [live,     setLive    ] = useState(false)

  // Geocode fallback if coords missing
  useEffect(() => {
    if (pickUpLat !== 0 && pickUpLon !== 0) return
    if (!pickUp) return
    ;(async () => {
      try {
        const res  = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(pickUp)}&limit=1&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`)
        const data = await res.json()
        if (data.features?.length) {
          const [lon, lat] = data.features[0].geometry.coordinates
          setPickUpLat(lat)
          setPickUpLon(lon)
        }
      } catch (e) { console.log(e) }
    })()
  }, [pickUp, pickUpLat, pickUpLon])

  const fetchVehicles = async (lat: number, lon: number) => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) return
    setLoading(true)
    try {
      const { data } = await axios.post('/api/vehicles/near-by', {
        latitude: lat,
        longitude: lon,
        vehicleType,
      })
      const list = Array.isArray(data) ? data : data.vehicles || []
      setVehicles(list)
      setLive(true)
    } catch (e) {
      console.log(e)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (pickUpLat && pickUpLon) fetchVehicles(pickUpLat, pickUpLon)
  }, [pickUpLat, pickUpLon])

  const handleBook = (v: IVehicle) => {
    const fare = v.baseFare && v.pricePerKM && distance
      ? Math.round(v.baseFare + v.pricePerKM * distance)
      : 0
    router.push(
      `/user/checkout?pickup=${encodeURIComponent(pickUp)}&drop=${encodeURIComponent(drop)}&mobile=${mobile}&pickuplat=${pickUpLat}&pickuplon=${pickUpLon}&droplat=${dropLat}&droplon=${dropLon}&fare=${fare}&vehicle=${v.type}&driverId=${v.owner}&vehicleId=${v._id}`
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">

      {/* ── FULL WIDTH MAP ── */}
      <div className="w-full h-[52vh] relative bg-zinc-200">
        <SearchMap
          pickUp={pickUp}
          drop={drop}
          onChange={(p, d) => { setPickUp(p); setDrop(d) }}
          onDistance={(d) => setDistance(d)}
        />
      </div>

      {/* ── BOTTOM PANEL ── */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Pickup / Drop address card */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-100">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
              <div className="w-px h-6 bg-zinc-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Pickup</p>
              <p className="text-sm font-semibold text-zinc-900 truncate">{pickUp}</p>
            </div>
            <MapPin size={15} className="text-zinc-300 shrink-0" />
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Drop</p>
              <p className="text-sm font-semibold text-zinc-900 truncate">{drop}</p>
            </div>
            <Navigation size={15} className="text-zinc-300 shrink-0" />
          </div>
        </div>

        {/* Available header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Available</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {TYPE_CONFIG[vehicleType]?.label} rides near your pickup
              {distance ? ` · ${distance.toFixed(1)} km` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {live && (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            )}
            <button
              onClick={() => fetchVehicles(pickUpLat, pickUpLon)}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 border border-zinc-200 px-3 py-1.5 rounded-full hover:bg-zinc-50"
            >
              <RefreshCcw size={11} />
              Refresh
            </button>
          </div>
        </div>

        {/* Vehicle cards */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Search size={24} className="text-zinc-300 animate-pulse" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Zap size={32} className="text-zinc-200" />
            <p className="text-sm text-zinc-400 font-medium">No vehicles found nearby</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            <AnimatePresence>
              {vehicles.map((v, i) => {
                const { Icon, label } = TYPE_CONFIG[v.type] ?? TYPE_CONFIG.car
                const fare = v.baseFare && v.pricePerKM && distance
                  ? Math.round(v.baseFare + v.pricePerKM * distance)
                  : 0

                return (
                  <motion.div
                    key={v._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="snap-start shrink-0 w-[200px] bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col"
                  >
                    {/* Vehicle image */}
                    <div className="relative h-[120px] bg-zinc-50 flex items-center justify-center overflow-hidden">
                      {v.imageUrl ? (
                        <img
                          src={v.imageUrl}
                          alt={v.vehicleModel}
                          className="h-24 w-full object-contain"
                          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}
                        />
                      ) : (
                        <Icon size={48} className="text-zinc-200" />
                      )}
                      {/* Rating */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-white border border-zinc-100 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        <Star size={8} className="fill-zinc-900 text-zinc-900" />
                        4.8
                      </div>
                      {/* Type badge */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                        <Icon size={8} />{label}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <div>
                        <p className="font-black text-zinc-900 text-sm truncate">{v.vehicleModel}</p>
                        <p className="text-[10px] font-mono font-bold text-zinc-400 tracking-widest mt-0.5">{v.number}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-zinc-50 rounded-xl p-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Gauge size={9} className="text-zinc-400" />
                            <p className="text-[8px] text-zinc-400 font-bold uppercase">Per KM</p>
                          </div>
                          <p className="text-xs font-black text-zinc-900 flex items-center">
                            <IndianRupee size={9} />{v.pricePerKM}
                          </p>
                        </div>
                        <div className="bg-zinc-50 rounded-xl p-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock size={9} className="text-zinc-400" />
                            <p className="text-[8px] text-zinc-400 font-bold uppercase">Wait</p>
                          </div>
                          <p className="text-xs font-black text-zinc-900 flex items-center">
                            <IndianRupee size={9} />{v.waitingCharge}<span className="text-[8px] text-zinc-400">/min</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 mt-auto">
                        <div>
                          <p className="text-[8px] text-zinc-400 font-bold uppercase">Est. Fare</p>
                          <p className="text-lg font-black text-zinc-900 flex items-center leading-none">
                            <IndianRupee size={11} />{fare}
                          </p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleBook(v)}
                          className="flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-black px-4 py-2 rounded-xl"
                        >
                          Book <ArrowRight size={11} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}