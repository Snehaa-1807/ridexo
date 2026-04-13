import { AlertTriangle, RefreshCw } from 'lucide-react'
import React from 'react'

function RejectionCard({ title, reason, actionLabel, onAction }: any) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 space-y-4">

      {/* Title */}
      <div className="flex items-center gap-2 text-red-600 font-semibold text-sm sm:text-base">
        <AlertTriangle size={18} />
        {title}
      </div>

      {/* Rejection Reason */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Reason for rejection
        </p>
        <div className="bg-white border border-red-100 rounded-xl p-4 text-sm sm:text-base text-gray-700 leading-relaxed">
          {reason || "No reason provided."}
        </div>
      </div>

      {/* What to do */}
      <div className="bg-red-100 rounded-xl p-3 text-xs sm:text-sm text-red-700">
        <strong>What to do:</strong> Please review the reason above, make the necessary changes, and resubmit your request.
      </div>

      {/* Action Button */}
      {onAction && (
        <button
          onClick={onAction}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm sm:text-base font-medium hover:bg-gray-800 transition"
        >
          <RefreshCw size={15} />
          {actionLabel || "Resubmit"}
        </button>
      )}
    </div>
  )
}

export default RejectionCard