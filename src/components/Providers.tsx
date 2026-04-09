"use client";

import { SessionProvider } from "next-auth/react";
import axios from "axios";

// Configure axios globally
axios.defaults.baseURL = process.env.NEXTAUTH_URL || 'http://localhost:3001';
axios.defaults.withCredentials = true;

console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("axios baseURL set to:", axios.defaults.baseURL);

export default function Providers({ children }: { children: React.ReactNode }) {
  console.log("Providers component rendering, axios baseURL:", axios.defaults.baseURL);
  return <SessionProvider>{children}</SessionProvider>;
}