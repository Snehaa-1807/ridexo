"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UploadCloud, FileCheck, CircleDashed } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

type docsType = "aadhar" | "license" | "rc";

function Page() {
  const router = useRouter();

  // ✅ FIXED STATE TYPE
  const [docs, setDocs] = useState<Record<docsType, File | null>>({
    aadhar: null,
    license: null,
    rc: null,
  });
const [loading,setLoading]=useState(false)
const [error,setError]=useState("")
const handleDocs = async () => {
  setLoading(true);
  setError("");

  try {
    // ✅ FIXED VALIDATION BLOCK
    if (!docs.aadhar || !docs.license || !docs.rc) {
      setError("All documents are required");
      setLoading(false);
      return;
    }

    const formdata = new FormData();

    formdata.append("aadhar", docs.aadhar);
    formdata.append("license", docs.license);
    formdata.append("rc", docs.rc);

    const { data } = await axios.post(
      "/api/partner/onboarding/documents",
      formdata
    );

    setLoading(false);

    router.push("/partner/onboarding/bank");

  } catch (error: any) {
    setError(error?.response?.data?.message ?? "something went wrong");
    setLoading(false);
  }
};
  // ✅ FIXED FILE HANDLER
  const handleImage = (doc: docsType, file: File | null) => {
    if (!file) return;

    setDocs((prev) => ({
      ...prev,
      [doc]: file,
    }));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        {/* Header */}
        <div className="relative text-center">
          <button
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <p className="text-xs text-gray-500 font-medium">Step 2 of 3</p>

          <h1 className="text-2xl font-bold mt-1">
            Upload Documents
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Required for verification
          </p>
        </div>

        {/* Upload Sections */}
        <div className="mt-8 space-y-5">

          {/* Aadhaar */}
          <motion.label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition">
            <div>
              <p className="text-sm font-semibold">Aadhaar / ID Proof</p>
              <p className="text-xs text-gray-500">Government issued ID</p>
            </div>

            <UploadCloud />
            <input
              type="file"
              hidden
              onChange={(e) =>
                handleImage("aadhar", e.target.files?.[0] || null)
              }
            />
          </motion.label>

          {/* License */}
          <motion.label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition">
            <div>
              <p className="text-sm font-semibold">Driving License</p>
              <p className="text-xs text-gray-500">Valid license</p>
            </div>

            <UploadCloud />
            <input
              type="file"
              hidden
              onChange={(e) =>
                handleImage("license", e.target.files?.[0] || null)
              }
            />
          </motion.label>

          {/* RC */}
          <motion.label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition">
            <div>
              <p className="text-sm font-semibold">Vehicle RC</p>
              <p className="text-xs text-gray-500">Registration Certificate</p>
            </div>

            <UploadCloud />
            <input
              type="file"
              hidden
              onChange={(e) =>
                handleImage("rc", e.target.files?.[0] || null)
              }
            />
          </motion.label>
        </div>

        {/* Info */}
        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <FileCheck size={16} />
          <p>
            Documents are securely stored and manually verified.
          </p>
        </div>
        {error &&         <p className="text-red-500 mt-4">*{error}</p>
 }
        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDocs}
          disabled={loading}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center"
        >
        {loading ? (
    <CircleDashed className="text-white animate-spin" />
  ) : (
    "Continue"
  )}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Page;