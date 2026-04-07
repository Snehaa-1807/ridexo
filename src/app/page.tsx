import { auth } from "@/auth"; // make sure you import this
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import connectDb from "./lib/db";
import User from "./models/user.model";

export default async function Home() {
  await connectDb()
  const session = await auth();
  const user=await User.findOne({email: session?.user?.email})

  return (
    <div className="w-full min-h-screen bg-white">

      {
        session?.user?.role === "partner" ? (
          <>      <Nav />
                    <PartnerDashboard />

</>
        ) : user?.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <><Nav />
          <PublicHome />
          </>
        )
      }

      <Footer />
    </div>
  );
}