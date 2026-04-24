'use client'

import { getSocket } from '@/app/lib/socket'
import React, { useEffect, useRef } from 'react'
import axios from 'axios'

function GeoUpdater({ userId }: { userId: string }) {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)

  useEffect(() => {
    if (!userId) return
    if (!navigator.geolocation) return

    socketRef.current = getSocket()
    socketRef.current.emit("identity", userId)

    const watcher = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // Update via socket (real-time)
        socketRef.current?.emit("update-location", {
          userId,
          latitude,
          longitude,
        })

        // Also save to DB so $near query works
        try {
          await axios.post("/api/partner/go-online", { latitude, longitude })
        } catch (e) {
          console.log("go-online error", e)
        }
      },
      (error) => {
        console.log("GeoUpdater error:", error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watcher)
      socketRef.current?.disconnect()
    }
  }, [userId])

  return null
}

export default GeoUpdater