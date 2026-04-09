'use client'
import React from 'react'

function DocPreview({ label, url }: any) {
  const isImage = /\.(jpeg|jpg|webp|png)$/i.test(url || "")
  const isPdf = url?.toLowerCase().includes(".pdf")

  return (
    <div className="bg-gray-50 rounded-2xl border overflow-hidden shadow-sm">

      {/* Header */}
      <div className="px-4 py-2 border-b text-sm font-semibold">
        {label}
      </div>

      {/* Content */}
      <div className="h-52 flex items-center justify-center bg-white">

        {!url ? (
          <span className="text-xs text-gray-400">
            Image Not Uploaded
          </span>

        ) : isImage ? (
          <img
            src={url}
            className="w-full h-full object-cover"
            alt={label}
          />

        ) : isPdf ? (
          <iframe
            src={url}
            className="w-full h-full"
            title={label}
          />

        ) : (
          <span className="text-xs text-gray-400">
            Unsupported File
          </span>
        )}
      </div>

      {/* Open Full */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs py-2 font-medium hover:bg-gray-100"
        >
          Open Full Document
        </a>
      )}

    </div>
  )
}

export default DocPreview