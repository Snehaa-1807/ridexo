"use client"
import React, { useEffect } from 'react'
import useGetMe from './hooks/useGetMe'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

function InitUser() {
const { status, data: session } = useSession()
  const pathname = usePathname()

  // Skip useGetMe on admin routes
  const isAdminRoute = pathname?.startsWith('/admin')
  const shouldCallGetMe = status === "authenticated" && !isAdminRoute

  console.log("InitUser - status:", status, "isAdminRoute:", isAdminRoute, "shouldCallGetMe:", shouldCallGetMe, "userData:", session?.user)
  // Debug session changes
  useEffect(() => {
    console.log("InitUser session changed:", { status, session });
  }, [status, session]);
  // Call useGetMe when authenticated and not on admin routes
  useGetMe(shouldCallGetMe)

  return null
}

export default InitUser
