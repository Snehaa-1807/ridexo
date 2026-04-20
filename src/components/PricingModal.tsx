'use client'
import { AnimatePresence } from 'motion/react'
import { motion } from "framer-motion"   // ✅ FIX
import { IVehicle } from '@/app/models/vehicle.model'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ImagePlus, IndianRupee } from 'lucide-react'

type PropsType = {
  open: boolean,
  onClose: () => void,
  data: IVehicle | null
}

function PricingModal({ open, onClose, data }: PropsType) {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [baseFare, setBaseFare] = useState("")
  const [loading, setLoading] = useState(false)
  const [pricePerKM, setPricePerKM] = useState("")
  const [waitingCharge, setWaitingCharge] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (data) {
      setPreview(data?.imageUrl || null)
      setBaseFare(data.baseFare?.toString() || "")
      setPricePerKM(data.pricePerKM?.toString() || "")
      setWaitingCharge(data.waitingCharge?.toString() || "")
    }
  }, [data])

  const handleSubmit = async () => {
    if (!pricePerKM) {
      setError("Price per KM is required")
      return
    }
    setError("")
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("baseFare", baseFare)
      formData.append("waitingCharge", waitingCharge)
      formData.append("pricePerKM", pricePerKM)
      if (image) formData.append("image", image)

      await axios.post("/api/partner/onboarding/pricing", formData)
      onClose()
    } catch (error: any) {
  console.log("FULL ERROR:", error?.response?.status, error?.response?.data)
  setError(error?.response?.data?.message || "Something went wrong")
} finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className='p-6 border-b'>
              <h2 className='text-xl font-bold'>Pricing and Vehicle Image</h2>
            </div>

            <div className='p-6 space-y-6'>
              {/* Image Upload */}
              <label
                htmlFor='imageLabel'
                className='relative h-44 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden'
              >
                {preview ? (
                  <img src={preview} className='absolute inset-0 w-full h-full object-cover rounded-2xl' />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImagePlus size={28} />
                    <span className="text-sm">Upload vehicle image</span>
                  </div>
                )}
                <input
                  type='file'
                  accept='image/*'
                  id='imageLabel'
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImage(e.target.files[0])
                      setPreview(URL.createObjectURL(e.target.files[0]))
                    }
                  }}
                />
              </label>

              <div>
                <p className='text-sm font-semibold mb-1'>Base Fare</p>
                <div className='flex items-center gap-2 border rounded-xl px-4 py-3'>
                  <IndianRupee size={18} />
                  <input type='number' placeholder='Enter base fare' value={baseFare} onChange={(e) => setBaseFare(e.target.value)} className='w-full outline-none' />
                </div>
              </div>

              <div>
                <p className='text-sm font-semibold mb-1'>Price Per KM <span className="text-red-500">*</span></p>
                <div className='flex items-center gap-2 border rounded-xl px-4 py-3'>
                  <IndianRupee size={18} />
                  <input type='number' placeholder='Enter price per km' value={pricePerKM} onChange={(e) => setPricePerKM(e.target.value)} className='w-full outline-none' />
                </div>
              </div>

              <div>
                <p className='text-sm font-semibold mb-1'>Waiting Charge</p>
                <div className='flex items-center gap-2 border rounded-xl px-4 py-3'>
                  <IndianRupee size={18} />
                  <input type='number' placeholder='Enter waiting charge' value={waitingCharge} onChange={(e) => setWaitingCharge(e.target.value)} className='w-full outline-none' />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className='p-6 border-t flex gap-3'>
              <button className='flex-1 border rounded-xl py-2' onClick={onClose}>Cancel</button>
              <button
                className='flex-1 bg-black text-white rounded-xl py-2 disabled:opacity-60'
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PricingModal