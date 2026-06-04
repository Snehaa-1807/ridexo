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
  };

  useEffect(() => {
    if (userData?.role === "partner") {
      const loadCount = async () => {
        try {
          const { data } = await axios.get("/api/partner/bookings/pending-requests-count");
          setPendingCount(data ?? 0);
        } catch (error) {
          console.log(error);
        }
      };

      void loadCount();
    }
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

  return (
    <>
      <motion.div className="fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-3 md:px-4">

          <Image src="/logo.png" alt="logo" width={40} height={40} className="w-8 h-8 md:w-11 md:h-11" />

          <div className="hidden md:flex gap-8">
            {userData?.role === "partner" ? (
              <>
                <Link className="relative text-sm font-medium text-gray-300 hover:text-white transition" href="/">Home</Link>

                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href="/partner/pending-requests"
                >
                  Pending Requests <span className="absolute -top-2 -right-5 w-6 h-6 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                </Link>

                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href="/partner/bookings"
                >
                  Bookings
                </Link>

                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href="/partner/active-ride"
                >
                  Active Ride
                </Link>
              </>
            ) : (
              Nav_Items.map((i) => {
                let href;

                if (i === "Home") {
                  href = "/";
                } else {
                  href = `/user/${i.toLowerCase()}`;
                }

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
              })
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              {sessionUser ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="w-10 h-10 bg-white text-black rounded-full"
                    type="button"
                  >
                    {sessionUser?.name?.charAt(0).toUpperCase()}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div className="absolute top-12 right-0 bg-white text-black p-4 rounded-xl w-64">

                        <p className="font-semibold">
                          {sessionUser?.name}
                        </p>

                        <p className="text-xs mb-3">
                          {userRole}
                        </p>

                        {userRole !== "partner" && (
                          <button
                            type="button"
                            className="w-full text-left flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl"
                            onClick={() => router.push("/partner/status")}
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
                          </button>
                        )}

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
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="bg-white text-black px-4 py-1 rounded-full"
                  type="button"
                >
                  Login
                </button>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              className="md:hidden px-3 md:px-4 mt-4 flex flex-col gap-3 pb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >

              {userData?.role === "partner" ? (
                <>
                  <Link
                    className="text-sm font-medium text-gray-300 hover:text-white transition py-2"
                    href="/"
                    onClick={() => setMobileOpen(false)}
                  >
                    Home
                  </Link>

                  <Link
                    className="text-sm font-medium text-gray-300 hover:text-white transition py-2 flex items-center gap-2"
                    href="/partner/pending-requests"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>Pending Requests</span>
                    <span className="w-5 h-5 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold">
                      {pendingCount}
                    </span>
                  </Link>

                  <Link
                    className="text-sm font-medium text-gray-300 hover:text-white transition py-2"
                    href="/partner/bookings"
                    onClick={() => setMobileOpen(false)}
                  >
                    Bookings
                  </Link>

                  <Link
                    className="text-sm font-medium text-gray-300 hover:text-white transition py-2"
                    href="/partner/active-ride"
                    onClick={() => setMobileOpen(false)}
                  >
                    Active Ride
                  </Link>
                </>
              ) : (
                Nav_Items.map((i) => {
                  let href;

                  if (i === "Home") {
                    href = "/";
                  } else {
                    href = `/user/${i.toLowerCase()}`;
                  }

                  return (
                    <Link
                      key={i}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-gray-300 hover:text-white transition py-2"
                    >
                      {i}
                    </Link>
                  );
                })
              )}

              {sessionUser ? (
                <>
                  {userRole !== "partner" && (
                    <button
                      type="button"
                      className="flex items-center gap-2 mt-2 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
                      onClick={() => {
                        router.push("/partner/status");
                        setMobileOpen(false);
                      }}
                    >
                      <div className="flex -space-x-1">
                        <Bike size={14} />
                        <Car size={14} />
                        <Truck size={14} />
                      </div>
                      <span>Become Partner</span>
                      <ChevronRight size={14} className="ml-auto" />
                    </button>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700">
                    <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold">
                      {sessionUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-400 flex-1 truncate">{sessionUser?.name}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 mt-2 py-2 text-sm font-medium text-gray-300 hover:text-white transition w-full"
                    type="button"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthOpen(true);
                    setMobileOpen(false);
                  }}
                  className="bg-white text-black px-4 py-2 rounded-full mt-2 font-medium text-sm w-full"
                  type="button"
                >
                  Login
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}

export default Nav;