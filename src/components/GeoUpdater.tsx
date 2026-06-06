'use client'

import { getSocket } from '@/app/lib/socket'
import React, { useEffect, useRef } from 'react'
import axios from 'axios'

function GeoUpdater({ userId }: { userId: string }) {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)

  useEffect(() => {
    if (!userId) return

    socketRef.current = getSocket()

    const emitIdentity = () => {
      socketRef.current?.emit("identity", userId)
      console.log("✅ identity emitted for:", userId)
    }

    // If already connected emit immediately, otherwise wait for connect
    if (socketRef.current.connected) {
      emitIdentity()
    }

    // Handles initial connection + reconnects
    socketRef.current.on("connect", emitIdentity)

    // Location watching
    if (!navigator.geolocation) return

    const watcher = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        socketRef.current?.emit("update-location", {
          userId,
          latitude,
          longitude,
        })

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
      socketRef.current?.off("connect", emitIdentity)
      navigator.geolocation.clearWatch(watcher)
    }
  }, [userId])

  return null
}

export default GeoUpdater