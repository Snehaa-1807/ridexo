"use client";

import L from 'leaflet'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Props = {
  driverLocation: [number, number] | null
  pickUpLocation: [number, number] | null
  dropLocation:   [number, number] | null
  mapStatus:      "arriving" | "ongoing" | "completed"
  onStats?: (data: {
    distanceToPickup: number
    etaToPickup:      number
    distanceToDrop:   number
    etaToDrop:        number
  }) => void
}

const pickUpIcon = new L.DivIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.28))">
      <div style="background:#0a0a0a;color:#fff;padding:5px 13px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;font-family:system-ui">PICKUP</div>
      <div style="width:2px;height:9px;background:#0a0a0a"></div>
      <div style="width:10px;height:10px;background:#0a0a0a;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>
    </div>`,
  className:  "",
  iconSize:   [80, 50],
  iconAnchor: [40, 50],
})

const dropIcon = new L.DivIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.28))">
      <div style="background:#fff;color:#111;padding:5px 13px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;font-family:system-ui;border:1.5px solid #ddd">DROP</div>
      <div style="width:2px;height:9px;background:#0a0a0a"></div>
      <div style="width:10px;height:10px;background:#0a0a0a;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>
    </div>`,
  className:  "",
  iconSize:   [70, 50],
  iconAnchor: [35, 50],
})

const driverIcon = new L.DivIcon({
  html: `
    <div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.5))">
      <div style="background:#0a0a0a;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 3px #fff,0 8px 28px rgba(0,0,0,0.5)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 11L6.5 6.5H17.5L19 11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          <rect x="3" y="11" width="18" height="7" rx="2" stroke="white" strokeWidth="1.6"/>
          <circle cx="7.5" cy="18.5" r="1.5" fill="white"/>
          <circle cx="16.5" cy="18.5" r="1.5" fill="white"/>
          <path d="M3 14H21" stroke="white" strokeWidth="1" opacity="0.35"/>
        </svg>
      </div>
    </div>`,
  className:  "",
  iconSize:   [52, 52],
  iconAnchor: [26, 52],
})

// Auto-fit map bounds when markers change
function AutoFit({ positions }: { positions: ([number, number] | null)[] }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    const valid = positions.filter(Boolean) as [number, number][]
    // Fit as soon as we have at least pickup + drop (2 points)
    if (valid.length >= 2) {
      try {
        map.fitBounds(valid, { padding: [80, 80], maxZoom: 14, animate: true })
        fitted.current = true
      } catch {}
    }
  }, [positions.map(p => p?.join(',')).join('|')])

  return null
}

function LiveRideMap({ driverLocation, pickUpLocation, dropLocation, mapStatus, onStats }: Props) {
  const [routeToPickUp, setRouteToPickUp] = useState<[number, number][]>([])
  const [routeToDrop,   setRouteToDrop  ] = useState<[number, number][]>([])
  const onStatsRef = useRef(onStats)
  onStatsRef.current = onStats

  const getRoute = async (
    startLat: number, startLon: number,
    endLat: number,   endLon: number
  ) => {
    const res = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`
    )
    return res.data.routes?.[0]
  }

  useEffect(() => {
    // Load route even without driver location — use pickUp as start if no driver
    if (!pickUpLocation || !dropLocation) return

    const [pLat, pLon] = pickUpLocation
    const [dLat, dLon] = dropLocation

    // Use driver position if available, otherwise use pickup as fallback
    const [drLat, drLon] = driverLocation ?? pickUpLocation

    const fetchRoutes = async () => {
      try {
        if (mapStatus === "arriving") {
          const [pickUpRoute, dropRoute] = await Promise.all([
            getRoute(drLat, drLon, pLat, pLon),
            getRoute(pLat, pLon, dLat, dLon),
          ])

          if (pickUpRoute) {
            setRouteToPickUp(
              pickUpRoute.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
            )
          }
          if (dropRoute) {
            setRouteToDrop(
              dropRoute.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
            )
          }

          onStatsRef.current?.({
            distanceToPickup: (pickUpRoute?.distance ?? 0) / 1000,
            etaToPickup:      (pickUpRoute?.duration ?? 0) / 60,
            distanceToDrop:   (dropRoute?.distance ?? 0) / 1000,
            etaToDrop:        (dropRoute?.duration ?? 0) / 60,
          })

        } else if (mapStatus === "ongoing") {
          setRouteToPickUp([])
          const dropRoute = await getRoute(drLat, drLon, dLat, dLon)

          if (dropRoute) {
            setRouteToDrop(
              dropRoute.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
            )
          }

          onStatsRef.current?.({
            distanceToPickup: 0,
            etaToPickup:      0,
            distanceToDrop:   (dropRoute?.distance ?? 0) / 1000,
            etaToDrop:        (dropRoute?.duration ?? 0) / 60,
          })
        }
      } catch (error) {
        console.log("Route fetch error:", error)
      }
    }

    fetchRoutes()
  }, [
    driverLocation?.[0], driverLocation?.[1],
    pickUpLocation?.[0], pickUpLocation?.[1],
    dropLocation?.[0],   dropLocation?.[1],
    mapStatus,
  ])

  // Default center — India center if nothing loaded yet
  const center: [number, number] =
    pickUpLocation ?? driverLocation ?? [23.2599, 77.4126]

  const showPickupMarker = mapStatus === "arriving" && !!pickUpLocation
  const showPickUpRoute  = mapStatus === "arriving" && routeToPickUp.length > 0
  const showDropRoute    = mapStatus !== "completed" && routeToDrop.length > 0

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Auto-fit bounds */}
        <AutoFit positions={[driverLocation, pickUpLocation, dropLocation]} />

        {/* Pickup marker */}
        {showPickupMarker && (
          <Marker position={pickUpLocation!} icon={pickUpIcon} />
        )}

        {/* Drop marker */}
        {dropLocation && (
          <Marker position={dropLocation} icon={dropIcon} />
        )}

        {/* Driver marker */}
        {driverLocation && (
          <Marker position={driverLocation} icon={driverIcon} />
        )}

        {/* Route to pickup (dashed grey) */}
        {showPickUpRoute && (
          <Polyline
            positions={routeToPickUp}
            pathOptions={{ color: "#888", weight: 4, dashArray: "2 10", lineCap: "round" }}
          />
        )}

        {/* Route to drop (solid black) */}
        {showDropRoute && (
          <Polyline
            positions={routeToDrop}
            pathOptions={{ color: "#0a0a0a", weight: 4, lineCap: "round", lineJoin: "round" }}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default LiveRideMap