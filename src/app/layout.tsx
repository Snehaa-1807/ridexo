import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css"
import Providers from "@/components/Providers";
import ReduxProvider from "@/redux/ReduxProvider";
import InitUser from "@/InitUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: " RideXo - Smart Vehicle Booking Platform",
  description: "RideXo is a smart vehicle booking platform that provides fast, reliable, and hassle-free transportation solutions. Whether you need a ride for daily travel or special trips, RideXo ensures comfort, convenience, and efficiency at your fingertips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
