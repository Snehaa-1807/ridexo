"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";
import { useSession, signOut } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import { Bike, Car, ChevronRight, LogOut, Truck, Menu, X } from "lucide-react";
import { getSocket } from "@/app/lib/socket";

const Nav_Items = ["Home", "Bookings", "About Us", "Contact"];

function Nav() {
  const pathName = usePathname();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const { data: session } = useSession();
  const sessionUser = session?.user as { name?: string; role?: string } | undefined;
  const userRole = sessionUser?.role;
  const userData = useSelector((state: RootState) => state.user.userData);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setProfileOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (userData?.role !== "partner") return;
    const loadCount = async () => {
      try {
        const { data } = await axios.get("/api/partner/bookings/pending-requests-count");
        setPendingCount(data ?? 0);
      } catch (error) {
        console.log(error);
      }
    };
    void loadCount();
  }, [userData?.role]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("new-booking", () => {
      setPendingCount((prev) => prev + 1);
    });
    return () => {
      socket.off("new-booking");
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-profile-dropdown]")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  return (
    <>
      {/* ── PILL NAVBAR — only the top bar, always rounded-full ── */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6">

          {/* Logo */}
          <Image src="/logo.png" alt="logo" width={40} height={40} className="w-9 h-9" />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {userData?.role === "partner" ? (
              <>
                <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition">Home</Link>
                <Link href="/partner/pending-requests" className="relative text-sm font-medium text-gray-300 hover:text-white transition">
                  Pending Requests
                  <span className="absolute -top-2.5 -right-6 w-5 h-5 bg-white text-black text-[10px] rounded-full flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                </Link>
                <Link href="/partner/bookings" className="text-sm font-medium text-gray-300 hover:text-white transition">Bookings</Link>
                <Link href="/partner/active-ride" className="text-sm font-medium text-gray-300 hover:text-white transition">Active Ride</Link>
              </>
            ) : (
              Nav_Items.map((i) => {
                const href = i === "Home" ? "/" : `/user/${i.toLowerCase().replace(/\s+/g, "-")}`;
                return (
                  <Link key={i} href={href} className={`text-sm font-medium transition ${href === pathName ? "text-white" : "text-gray-400 hover:text-white"}`}>
                    {i}
                  </Link>
                );
              })
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Desktop auth */}
            <div className="hidden md:block" data-profile-dropdown>
              {sessionUser ? (
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="w-9 h-9 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-100 transition"
                  type="button"
                >
                  {sessionUser?.name?.charAt(0).toUpperCase()}
                </button>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="bg-white text-black px-5 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
                  type="button"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile burger */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMobileOpen((p) => !p)}
              type="button"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU — completely outside the pill navbar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-40 bg-[#0B0B0B] text-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-1">
              {/* Nav links */}
              {userData?.role === "partner" ? (
                <>
                  <Link href="/" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 py-3 px-3 rounded-xl transition">
                    Home
                  </Link>
                  <Link href="/partner/pending-requests" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 py-3 px-3 rounded-xl transition">
                    Pending Requests
                    <span className="w-5 h-5 bg-white text-black text-[10px] rounded-full flex items-center justify-center font-bold ml-1">
                      {pendingCount}
                    </span>
                  </Link>
                  <Link href="/partner/bookings" onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 py-3 px-3 rounded-xl transition">
                    Bookings
                  </Link>
                  <Link href="/partner/active-ride" onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 py-3 px-3 rounded-xl transition">
                    Active Ride
                  </Link>
                </>
              ) : (
                Nav_Items.map((i) => {
                  const href = i === "Home" ? "/" : `/user/${i.toLowerCase().replace(/\s+/g, "-")}`;
                  return (
                    <Link key={i} href={href} onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 py-3 px-3 rounded-xl transition">
                      {i}
                    </Link>
                  );
                })
              )}

              {/* Divider */}
              <div className="border-t border-white/10 my-2" />

              {/* User section */}
              {sessionUser ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {sessionUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{sessionUser?.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{userRole}</p>
                    </div>
                  </div>

                  {userRole !== "partner" && (
                    <button
                      type="button"
                      onClick={() => { router.push("/partner/status"); setMobileOpen(false); }}
                      className="flex items-center gap-3 py-3 px-3 hover:bg-white/10 rounded-xl transition text-sm text-gray-300 hover:text-white w-full text-left"
                    >
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><Bike size={11} /></div>
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><Car size={11} /></div>
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><Truck size={11} /></div>
                      </div>
                      <span>Become Partner</span>
                      <ChevronRight size={14} className="ml-auto text-gray-500" />
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    type="button"
                    className="flex items-center gap-3 py-3 px-3 hover:bg-white/10 rounded-xl transition text-sm text-gray-300 hover:text-white w-full"
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="w-full bg-white text-black py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
                  type="button"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PROFILE DROPDOWN — outside everything, never clipped ── */}
      <AnimatePresence>
        {profileOpen && (
          <motion.div
            data-profile-dropdown
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[72px] right-[3%] md:right-[7%] z-50 bg-white text-black p-4 rounded-2xl w-64 shadow-2xl border border-gray-100"
          >
            <div className="mb-3 pb-3 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm">{sessionUser?.name}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{userRole}</p>
            </div>

            {userRole !== "partner" && (
              <button
                type="button"
                onClick={() => { router.push("/partner/status"); setProfileOpen(false); }}
                className="w-full flex items-center gap-3 py-2.5 px-2 hover:bg-gray-50 rounded-xl transition text-sm mb-1"
              >
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"><Bike size={12} /></div>
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"><Car size={12} /></div>
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"><Truck size={12} /></div>
                </div>
                <span className="font-medium text-gray-800">Become Partner</span>
                <ChevronRight size={14} className="ml-auto text-gray-400" />
              </button>
            )}

            <button
              onClick={handleLogout}
              type="button"
              className="w-full flex items-center gap-3 py-2.5 px-2 hover:bg-gray-50 rounded-xl transition text-sm text-gray-700"
            >
              <LogOut size={14} className="text-gray-500" />
              <span className="font-medium">Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export default Nav;