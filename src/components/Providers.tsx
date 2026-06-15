"use client";

import { SessionProvider } from "next-auth/react";
import axios from "axios";
import { useEffect } from "react";

// Configure axios globally — use relative URLs (current origin)
axios.defaults.baseURL = "";
axios.defaults.withCredentials = true;

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log("axios baseURL:", axios.defaults.baseURL || "(relative — same origin)");
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}