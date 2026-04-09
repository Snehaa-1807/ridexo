"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

interface PartnerReview {
  id: string;
  name: string;
  email: string;
  vehicleType?: string;
}

interface AdminStats {
  totalApprovedPartners: number;
  totalPendingPartners: number;
  totalRejectedPartners: number;
  totalPartners: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [adminData, setAdminData] = useState<{
    stats: AdminStats;
    partnerReviews: PartnerReview[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state: RootState) => state.user.userData);
  const router = useRouter();

  console.log("Home page - session status:", status, "session:", session, "userData:", userData);

  // Debug session changes
  useEffect(() => {
    console.log("Session changed:", { status, session, userData });
  }, [status, session, userData]);

  // Redirect pending partners to status page
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "partner" && userData?.partnerStatus !== "approved") {
      router.push("/partner/status");
    }
  }, [status, session, userData, router]);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (status === "authenticated" && (session?.user as any)?.role === "admin") {
        console.log("Fetching admin data for user:", session?.user);
        try {
          const response = await fetch("/api/admin/dashboard", {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            console.log("Admin data fetched:", data);
            setAdminData(data);
          } else {
            console.error("Failed to fetch admin data:", response.status);
          }
        } catch (error) {
          console.error("Failed to fetch admin data:", error);
        }
      }
      setLoading(false);
    };

    if (status !== "loading") {
      fetchAdminData();
    }
  }, [status, session?.user]);

  if (status === "loading" || loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return (
      <div className="w-full min-h-screen bg-white">
        <Nav />
        <PublicHome />
        <Footer />
      </div>
    );
  }

  if ((session.user as any)?.role === "partner") {
    // Pending partners are redirected to status page, approved partners see dashboard
    if (userData?.partnerStatus === "approved") {
      return (
        <div className="w-full min-h-screen bg-white">
          <Nav />
          <PartnerDashboard />
          <Footer />
        </div>
      );
    } else {
      // Show loading while redirecting
      return (
        <div className="w-full min-h-screen bg-white flex items-center justify-center">
          <div className="text-lg">Redirecting to partner status...</div>
        </div>
      );
    }
  }

  if ((session.user as any)?.role === "admin" && adminData) {
    return (
      <div className="w-full min-h-screen bg-white">
        <AdminDashboard
          stats={adminData.stats}
          partnerReviews={adminData.partnerReviews}
          partnerkyc={[]}
          vehicleReviews={[]}
        />
        <Footer />
      </div>
    );
  }

  // Fallback for admin loading
  if ((session.user as any)?.role === "admin") {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <Nav />
      <PublicHome />
      <Footer />
    </div>
  );
}