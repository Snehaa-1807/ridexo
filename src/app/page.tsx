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
import GeoUpdater from "@/components/GeoUpdater";

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

type SessionUser = { role?: string };

export default function Home() {
  const { data: session, status } = useSession();
  const [adminData, setAdminData] = useState<{
    stats: AdminStats;
    partnerReviews: PartnerReview[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state: RootState) => state.user.userData);
  const router = useRouter();

  const userRole = (session?.user as SessionUser)?.role;

  useEffect(() => {
    if (status === "authenticated" && userRole === "partner" && userData?.partnerStatus !== "approved") {
      router.push("/partner/status");
    }
  }, [status, userRole, userData, router]);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (status === "authenticated" && userRole === "admin") {
        try {
          const response = await fetch("/api/admin/dashboard", { credentials: "include" });
          if (response.ok) {
            const data = await response.json();
            setAdminData(data);
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
  }, [status, userRole]);

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

  if (userRole === "partner") {
    if (userData?.partnerStatus === "approved") {
      return (
        <div className="w-full min-h-screen bg-white">
          <Nav />
          <GeoUpdater userId={userData._id ?? userData.id} />
          <PartnerDashboard />
          <Footer />
        </div>
      );
    }
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Redirecting to partner status...</div>
      </div>
    );
  }

  if (userRole === "admin" && adminData) {
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

  if (userRole === "admin") {
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