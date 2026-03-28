"use client";

import React, { useState } from "react";
import HeroSection from "./HeroSection";
import VehicleSlider from "./VehicleSlider";
import AuthModal from "./AuthModal";
import Footer from "./Footer";
import Nav from "./Nav";


const PublicHome = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Nav />
      <HeroSection onAuthRequired={() => setAuthOpen(true)} />
      <VehicleSlider />
<Footer/>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
};

export default PublicHome;