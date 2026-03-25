"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import AuthModal from "./AuthModal";
const Nav_Items = ["Home", "Bookings", "About Us", "Contact"];

function Nav() {
  const pathName = usePathname();
const [authOpen, setAuthOpen] = useState(false);
  return (
    <>
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-4"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <Image
          src="/logo.png"
          alt="Ridexo Logo"
          width={44}
          height={44}
          priority
        />

        <div className="hidden md:flex items-center gap-10">
          {Nav_Items.map((i, index) => {
            const href = i === "Home" ? "/" : `/${i.toLowerCase().replace(" ", "")}`;

            const active = href === pathName;

            return (
              <Link
                key={i}
                href={href}
                className={`text-sm font-medium transition ${
                  active
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {i}
              </Link>
            );
          })}
        </div>
       <button className="px-4 py-1.5 bg-white text-black rounded-full text-sm" onClick={()=> setAuthOpen(true)}>
  Login
</button>
      </div>
    </motion.div>
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
          </>

  );
}

export default Nav;