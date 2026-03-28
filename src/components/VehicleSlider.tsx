"use client";

import {
  Bike,
  Bus,
  Car,
  CarTaxiFront,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Truck,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const VEHICLE_CATEGORIES = [
  { title: "All Vehicles", desc: "Browse the full fleet", Icon: CarTaxiFront, tag: "Popular" },
  { title: "Bikes", desc: "Fast & affordable rides", Icon: Bike, tag: "Quick" },
  { title: "Cars", desc: "Comfortable city travel", Icon: Car, tag: "Comfort" },
  { title: "SUVs", desc: "Premium & spacious", Icon: Car, tag: "Premium" },
  { title: "Vans", desc: "Family & group transport", Icon: Bus, tag: "Family" },
  { title: "Trucks", desc: "Heavy & commercial transport", Icon: Truck, tag: "Cargo" },
];

function VehicleSlider() {
  const [hovered, setHovered] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full bg-white py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-zinc-900" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Fleet
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-none">
              Vehicles <br />
              Categories
            </h2>

            <p className="text-zinc-400 text-sm mt-3 font-medium">
              Choose the ride that fits your journey
            </p>
          </div>

          {/* ARROWS */}
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-11 h-11 rounded-xl border flex items-center justify-center hover:bg-zinc-900 hover:text-white transition"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() => scroll("right")}
              className="w-11 h-11 rounded-xl border flex items-center justify-center hover:bg-zinc-900 hover:text-white transition"
            >
              <ChevronRight />
            </button>
          </div>
        </motion.div>

        {/* SLIDER */}
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {VEHICLE_CATEGORIES.map((c, i) => {
            const isHovered = hovered === i;

            return (
              <motion.div
                key={i}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
                whileHover={{ y: -8 }}
                className="min-w-[220px] sm:min-w-[260px] flex-shrink-0 cursor-pointer"
              >
                <motion.div
                  animate={{
                    backgroundColor: isHovered ? "#09090b" : "#ffffff",
                    color: isHovered ? "#ffffff" : "#000000",
                  }}
                  className="rounded-3xl border p-6"
                >
                  {/* TAG */}
                  <div className="text-xs mb-4 flex items-center gap-1">
                    <Sparkles size={12} />
                    {c.tag}
                  </div>

                  {/* ICON */}
                  <div className="w-14 h-14 flex items-center justify-center border rounded-xl mb-4">
                    <c.Icon />
                  </div>

                  {/* TEXT */}
                  <h3 className="text-lg font-bold">{c.title}</h3>
                  <p className="text-sm opacity-70">{c.desc}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* FOOTER STATS */}
        <div className="flex gap-6 mt-8 pt-6 border-t">
          {[
            { num: "6+", label: "Categories" },
            { num: "50+", label: "Vehicles" },
            { num: "24/7", label: "Availability" },
          ].map((d, i) => (
            <div key={i}>
              <p className="font-bold">{d.num}</p>
              <p className="text-xs text-zinc-400">{d.label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default VehicleSlider;