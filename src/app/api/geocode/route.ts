import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  if (!q || q.trim().length < 2) {
    return NextResponse.json([], { status: 200 })
  }

  // Try Nominatim first
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
      {
        headers: {
          "Accept": "application/json",
          "Accept-Language": "en",
          "User-Agent": "ridexo-app/1.0 (contact@ridexo.com)",
        },
      }
    )

    const contentType = res.headers.get("content-type") || ""

    if (!res.ok || !contentType.includes("application/json")) {
      console.log("Nominatim returned non-JSON, status:", res.status)
      throw new Error("Nominatim non-JSON response")
    }

    const data = await res.json()

    const results = data.map((item: any) => ({
      id:      String(item.place_id),
      name:    item.display_name,
      country: item.address?.country,
      lat:     parseFloat(item.lat),
      lng:     parseFloat(item.lon),
    }))

    return NextResponse.json(results)

  } catch (nominatimError) {
    console.log("Nominatim failed, trying Geoapify fallback:", nominatimError)
  }

  // Fallback — Geoapify
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY

    if (!apiKey) {
      console.log("No Geoapify key set")
      return NextResponse.json([], { status: 200 })
    }

    const res2 = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&limit=6&apiKey=${apiKey}`
    )

    const data2 = await res2.json()

    if (!data2.features?.length) {
      return NextResponse.json([], { status: 200 })
    }

    const results = data2.features.map((f: any) => ({
      id:      String(f.properties.place_id || f.properties.osm_id),
      name:    f.properties.formatted,
      country: f.properties.country,
      lat:     f.geometry.coordinates[1],
      lng:     f.geometry.coordinates[0],
    }))

    return NextResponse.json(results)

  } catch (geoapifyError) {
    console.log("Geoapify fallback also failed:", geoapifyError)
    return NextResponse.json([], { status: 200 })
  }
}