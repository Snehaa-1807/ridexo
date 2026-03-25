"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, Lock , User, CircleDashed} from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
type propType = {
  open: boolean;
  onClose: () => void;
};
type stepType = "login" | "signup" | "otp";
function AuthModal({ open, onClose }: propType) {
    const [step, setStep] = useState<stepType>("login");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [name, setName] = useState("");
const [loading, setLoading] = useState(false);
const [err, setErr] = useState("");
const {data}= useSession();
console.log(data)

const handleSignUp = async () => {
    setLoading(true);
    try{
        const response = await axios.post("/api/auth/register", {name, email, password})
    console.log(response.data)
    setLoading(false);
    }catch(error: any){
    setLoading(false);
         setErr(error.response?.data?.message || "An error occurred during registration")
    }
}
const handleLogin = async () => {
    setLoading(true);
    const res = await signIn("credentials", {
        email, password, redirect: false
    })
        setLoading(false);

    console.log(res)
}
  return (
    <AnimatePresence>
    {open && (
      <>
        {/* Background Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)] p-6 sm:p-8 text-black"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-black transition"
          >
            ✕
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-widest">
              RIDEXO
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Premium Vehicle Booking
            </p>
          </div>

          {/* Content (placeholder) */}
          <div className="text-center">
            <p>Login / Register Form Here</p>
          </div>
          <button className='w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold text-black hover:bg-black hover:text-white transition'>
<Image src="/google.png" alt="Google" width={20} height={20}/>
Continue with Google
</button>
<div className='flex items-center gap-4 my-6'>
<div className='flex-1 h-px bg-black/10'/>
<div className='text-xs text-gray-500'>OR</div>
<div className='flex-1 h-px bg-black/10'/>
</div>
<div>
{step == "login" && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}>
        <h1 className='text-xl font-semibold' >Welcome back</h1>
<div className='mt-5 space-y-4'>
<div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
<Mail size={18} className='text-gray-500' />
<input type="text" placeholder='email'
className='w-full bg-transparent outline-none
text-sm' onChange={(e)=>setEmail(e.target.value)} value={email} />
</div>
<div className='flex items-center gap-3 border
border-black/20 rounded-x1 px-4 py-3'>
<Lock size={18} className='☐ text-gray-500' />
<input type="password" placeholder='password'
className='w-full bg-transparent outline-none
text-sm' onChange={(e)=>setPassword(e.target.value)} value={password} />
</div>
<button className='w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition' onClick={handleLogin}>{!loading ?  "Login":<CircleDashed size={18} color="white" className="animate-spin"/>}</button>
</div>
<p className="mt-6 text-center text-sm text-gray-500"> Don't have an account? <div onClick={()=> setStep ("signup")} className="text-black font-medium hover:underline">Sign Up</div> </p>
              </motion.div>

)}
{step == "signup" && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}>
        <h1 className='text-xl font-semibold' >Create Account</h1>
<div className='mt-5 space-y-4'>
<div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
<User size={18} className='text-gray-500' />
<input type="text" placeholder='Full Name'
className='w-full bg-transparent outline-none
text-sm' onChange={(e)=>setName(e.target.value)} value={name} />
</div>
<div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
<Mail size={18} className='text-gray-500' />
<input type="email" placeholder='email'
className='w-full bg-transparent outline-none
text-sm' onChange={(e)=>setEmail(e.target.value)} value={email} />
</div>
<div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
<Lock size={18} className='text-gray-500' />
<input type="password" placeholder='password'
className='w-full bg-transparent outline-none
text-sm' onChange={(e)=>setPassword(e.target.value)} value={password} />
</div>
{err && <p className="text-red-500 text-sm">*{err}</p>}
<button className='w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition' disabled={loading} onClick={handleSignUp}>{!loading ?  "Sign Up":<CircleDashed size={18} color="white" className="animate-spin"/>}</button>
</div>
<p className="mt-6 text-center text-sm text-gray-500"> Already have an account? <div onClick={()=> setStep ("login")} className="text-black font-medium hover:underline">Login</div> </p>
              </motion.div>

)}
        </div>
        </div>
      </motion.div>
    </>
    )}
    </AnimatePresence>
  );
}

export default AuthModal;