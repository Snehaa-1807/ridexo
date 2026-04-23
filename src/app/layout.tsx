import type { Metadata } from "next";
import "./globals.css";
import 'leaflet/dist/leaflet.css'
import Providers from "@/components/Providers";
import ReduxProvider from "@/redux/ReduxProvider";
import InitUser from "@/InitUser";

export const metadata: Metadata = {
  title: "RideXo - Smart Vehicle Booking Platform",
  description: "RideXo is a smart vehicle booking platform that provides fast, reliable, and hassle-free transportation solutions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          <ReduxProvider>
            <InitUser />
            {children}
          </ReduxProvider>
        </Providers>
      </body>
    </html>
  );
}