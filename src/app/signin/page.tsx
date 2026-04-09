"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

function SignInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authOpen, setAuthOpen] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      const userRole = (session?.user as any)?.role;

      if (userRole === "partner") {
        router.push("/partner/status");
      } else {
        router.push(callbackUrl);
      }
    }
  }, [status, router, searchParams, session]);

  if (status === "loading") {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <Nav />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In</h1>
          <p className="text-gray-600 mb-8">Please sign in to continue</p>
        </div>
      </div>
      <AuthModal
        open={authOpen}
        onClose={() => router.push("/")}
      />
      <Footer />
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}