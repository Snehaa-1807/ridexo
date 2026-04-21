'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import L from 'leaflet' 
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'

// ✅ FIX
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, Navigation2 } from 'lucide-react'

type props = {
  pickUp: string,
  drop: string,
  onChange: (p: string, d: string) => void,
  onDistance: (d: number) => void
}

function FitBounds({ p1, p2 }: { p1: [number, number], p2: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize()
    map.fitBounds([p1, p2], {
      padding: [72, 72],
      maxZoom: 15,
      animate: true,
      duration: 1
    })
  }, [p1, p2, map])

  return null
}

const pickUpIcon = new L.DivIcon({ html: `...`, className:"", iconSize:[90,58], iconAnchor:[45,58] })
const dropIcon = new L.DivIcon({ html: `...`, className:"", iconSize:[90,58], iconAnchor:[45,58] })

function SearchMap({ pickUp, drop, onChange, onDistance }: props) {

  const [p1, setP1] = useState<[number, number]>()
  const [p2, setP2] = useState<[number, number]>()
  const [route, setRoute] = useState<[number, number][]>([])
  const [km, setKm] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  const geoCoding = async (q: string): Promise<[number, number] | null> => {
    try {
const { data } = await axios.get(
  "https://api.geoapify.com/v1/geocode/autocomplete",
  {
    params: {
      text: q.trim(),
      apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
      filter: "countrycode:in", // India ke liye fix
      limit: 1,
    
    }
  }
)     
 if (!data.features.length) return null
      const [lon, lat] = data.features[0].geometry.coordinates
      return [lat, lon]
    } catch (error) {
      console.log(error)
      return null
    }
  }
const reverseGeoCoding = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const { data } = await axios.get(
  "https://api.geoapify.com/v1/geocode/reverse",
  {
    params: {
      lat,
      lon,
      apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
      filter: " countrycode: in" 
    }
  }
)

    if (!data.features.length) return null;

    const p = data.features[0].properties;

    return [p.name, p.street, p.city, p.state, p.country]
      .filter(Boolean)
      .join(", ");

  } catch (error) {
    console.log(error);
    return null;
  }
};
  const loadRoute = async (p: [number, number], d: [number, number]) => {
    try {
      const { data } = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${p[1]},${p[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`
      )

      if (!data.routes.length) return

      // ✅ FIXED
      setRoute(
        data.routes[0].geometry.coordinates.map(([lon, lat]: number[]) => [lat, lon])
      )

      const distKm = +((data.routes[0].distance) / 1000).toFixed(2)
      setKm(distKm)
      onDistance(distKm)

    } catch (error) {
      console.log(error)
    }
  }

  const dragPickUp = async (lat: number, lon: number) => {
   const addr= await reverseGeoCoding(lat,lon)
    setP1([lat, lon])
    if (p2) {loadRoute([lat, lon], p2)}
onChange?.(addr || "", drop)  }

  // ✅ FIX (closed function properly)
  const dragDrop = async (lat: number, lon: number) => {
       const addr= await reverseGeoCoding(lat,lon)

    setP2([lat, lon])
    if (p1) {loadRoute(p1, [lat, lon])}
onChange?.(pickUp, addr || "")
  }

  // ✅ FIX (outside function)
  useEffect(() => {
    setReady(false)

    if (pickUp && drop) {
      (async () => {
        const a = await geoCoding(pickUp)
        const b = await geoCoding(drop)

        if (!a || !b) return

        await loadRoute(a, b)

        setP1(a)
        setP2(b)
        setReady(true)
      })()
    }
  }, [pickUp, drop])

  return (
    <div className='relative h-full w-full bg-zinc-100'>

      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={p1 ?? [0, 0]}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />

        {p1 && p2 && <FitBounds p1={p1} p2={p2} />}

        {p1 && (
          <Marker
            position={p1}
            icon={pickUpIcon}
            draggable
            eventHandlers={{
              dragend: e => {
                const m = e.target.getLatLng()
                dragPickUp(m.lat, m.lng)
              }
            }}
          />
        )}

        {p2 && (
          <Marker
            position={p2}
            icon={dropIcon}
            draggable
            eventHandlers={{
              dragend: e => {
                const m = e.target.getLatLng()
                dragDrop(m.lat, m.lng)
              }
            }}
          />
        )}

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "#0a0a0a",
              weight: 4,
              lineCap: "round",
              lineJoin: "round"
            }}
          />
        )}

      </MapContainer>

      {/* LOADER */}
      <AnimatePresence>
        {!ready && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 z-[999] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <MapPin size={15} className='text-zinc-800' />
            <p className='text-xs font-black'>Loading Map</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISTANCE */}
      <AnimatePresence>
        {ready && km !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 left-4 bg-white px-3 py-2 rounded-xl shadow-lg flex gap-2"
          >
            <Navigation2 size={13} />
            <span>{km} km</span>
            <span>~ {Math.max(3, Math.round((km / 25) * 60))} min</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default SearchMap