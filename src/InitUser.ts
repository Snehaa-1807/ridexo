"use client"
import React, { useEffect } from 'react'
import useGetMe from './hooks/useGetMe'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { getSocket } from './app/lib/socket'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

function InitUser() {
const { status, data: session } = useSession()
  const pathname = usePathname()
  const userData = useSelector((state: RootState) => state.user.userData)

  // Skip useGetMe on admin routes
  const isAdminRoute = pathname?.startsWith('/admin')
  const shouldCallGetMe = status === "authenticated" && !isAdminRoute

  console.log("InitUser - status:", status, "isAdminRoute:", isAdminRoute, "shouldCallGetMe:", shouldCallGetMe, "userData:", session?.user)
  
  // Debug session changes
  useEffect(() => {
    console.log("InitUser session changed:", { status, session });
  }, [status, session]);

  // Initialize socket connection and emit identity event for authenticated users
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const socket = getSocket()
      
      // Emit identity event to register this user's socket connection
      socket.emit("identity", session.user.id)
      console.log("Socket identity emitted for user:", session.user.id)
    }
  }, [status, session?.user?.id])

  // Call useGetMe when authenticated and not on admin routes
  useGetMe(shouldCallGetMe)

  return null
}

export default InitUser
