"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation"; // ✅ added router
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
import { signOut } from "next-auth/react";
import {
  Bike,
  Car,
  ChevronRight,
  LogOut,
  Truck,
  Menu,
  X,
} from "lucide-react";

const Nav_Items = ["Home", "Bookings", "About Us", "Contact"];

function Nav() {
  const pathName = usePathname();
  const router = useRouter(); // ✅ added
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { userData } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    dispatch(setUserData(null));
    setProfileOpen(false);
  };

  return (
    <>
      <motion.div className="fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">

          <Image src="/logo.png" alt="logo" width={44} height={44} />

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8">
            {Nav_Items.map((i) => {
              const href =
                i === "Home"
                  ? "/"
                  : `/${i.toLowerCase().replace(/\s+/g, "-")}`;

              const active = href === pathName;

              return (
                <Link
                  key={i}
                  href={href}
                  className={active ? "text-white" : "text-gray-400"}
                >
                  {i}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {/* Desktop Auth */}
            <div className="hidden md:block">
              {!userData ? (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="bg-white text-black px-4 py-1 rounded-full"
                >
                  Login
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="w-10 h-10 bg-white text-black rounded-full"
                  >
                    {userData.name.charAt(0).toUpperCase()}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div className="absolute top-12 right-0 bg-white text-black p-4 rounded-xl w-64">
                        
                        <p className="font-semibold">{userData.name}</p>
                        <p className="text-xs mb-3">{userData.role}</p>

                        {/* ✅ Become Partner (Desktop) */}
                        {userData.role !== "partner" && (
                          <div
                            className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl cursor-pointer"
                            onClick={() =>
                              router.push("/partner/onboarding/vehicle")
                            }
                          >
                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                <Bike size={14} />
                              </div>
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                <Car size={14} />
                              </div>
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                <Truck size={14} />
                              </div>
                            </div>

                            Become Partner
                            <ChevronRight size={16} className="ml-auto" />
                          </div>
                        )}

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>

          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div className="md:hidden px-4 mt-4 flex flex-col gap-4">

              {Nav_Items.map((i) => {
                const href =
                  i === "Home"
                    ? "/"
                    : `/${i.toLowerCase().replace(/\s+/g, "-")}`;

                return (
                  <Link
                    key={i}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="text-gray-300"
                  >
                    {i}
                  </Link>
                );
              })}

              {!userData ? (
                <button
                  onClick={() => {
                    setAuthOpen(true);
                    setMobileOpen(false);
                  }}
                  className="bg-white text-black px-4 py-2 rounded-full"
                >
                  Login
                </button>
              ) : (
                <>
                  {/* ✅ Become Partner (Mobile) */}
                  {userData.role !== "partner" && (
                    <div
                      className="flex items-center gap-2 mt-2 cursor-pointer"
                      onClick={() => {
                        router.push("/partner/onboarding/vehicle");
                        setMobileOpen(false);
                      }}
                    >
                      <Bike size={14} />
                      <Car size={14} />
                      <Truck size={14} />
                      <span>Become Partner</span>
                      <ChevronRight size={14} className="ml-auto" />
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 mt-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export default Nav;