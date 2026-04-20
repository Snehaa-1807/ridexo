'use client'

import { getSocket } from '@/app/lib/socket'
import React, { useEffect, useRef } from 'react'

function GeoUpdater({ userId }: { userId: string }) {
  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (!userId) return
    if (!navigator.geolocation) return

    socketRef.current = getSocket()

    socketRef.current.emit("identity", userId)

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords  // ✅ FIX

        socketRef.current.emit("update-location", {
          userId,
          latitude,
          longitude
        })
      },
      (error) => {
        console.log(error) // ✅ FIX
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watcher)

      // ✅ optional but recommended
      socketRef.current?.disconnect()
    }

  }, [userId]) // ✅ FIX

  return null
}

export default GeoUpdater