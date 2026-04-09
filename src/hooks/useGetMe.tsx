"use client"
import { setUserData } from '@/redux/userSlice'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

function useGetMe(enabled:boolean) {
    const dispatch = useDispatch()
  useEffect(() => {
    if (!enabled) {
      console.log("useGetMe: disabled, not fetching")
      return
    }

    console.log("useGetMe: enabled, fetching user data")

    const getMe = async () => {
      try {
        const response = await fetch("/api/user/me", {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || `Request failed with status ${response.status}`)
        }

        const data = await response.json()
        console.log("useGetMe: fetched user data:", data)
        dispatch(setUserData(data))
      } catch (error) {
        console.log("useGetMe error:", error)
      }
    }

    getMe()
  }, [enabled])

}

export default useGetMe