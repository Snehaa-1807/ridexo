"use client"
import React from 'react'
import useGetMe from './hooks/useGetMe'
import { useSession } from 'next-auth/react'

function InitUser() {
const {status}=useSession()
useGetMe(status=="authenticated")
return null
}

export default InitUser
