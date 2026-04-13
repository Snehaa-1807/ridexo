'use client'
import { ExternalLink, FileText, ImageIcon } from 'lucide-react'
import React from 'react'

function DocPreview({ label, url }: any) {
  const isImage = /\.(jpeg|jpg|webp|png|gif)$/i.test(url || "")
  const isPdf = url?.toLowerCase().includes(".pdf") || url?.toLowerCase().includes("/raw/")

  const openDoc = () => {
    if (url) window.open(url, '_blank')
  }

  return (
    <div className="bg-gray-50 rounded-2xl border overflow-hidden shadow-sm flex flex-col">
      <div className="px-4 py-2 border-b text-sm font-semibold bg-white">
        {label}
      </div>

      <div className="h-52 flex items-center justify-center bg-white flex-1">
        {!url ? (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <ImageIcon size={28} />
            <span className="text-xs">Not Uploaded</span>
          </div>
        ) : isImage ? (
          <img src={url} className="w-full h-full object-cover" alt={label} />
        ) : isPdf ? (
          <div className="flex flex-col items-center gap-3 text-gray-500 p-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <FileText size={28} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">PDF Document</p>
              <p className="text-xs text-gray-400 mt-0.5">Click below to open</p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Unsupported File</span>
        )}
      </div>

      {url && (
        <button
          onClick={openDoc}
          className="flex items-center justify-center gap-2 text-xs py-2.5 font-medium hover:bg-gray-100 border-t transition text-gray-600 w-full"
        >
          <ExternalLink size={13} />
          Open {isPdf ? "PDF" : "Document"}
        </button>
      )}
    </div>
  )
}

export default DocPreview