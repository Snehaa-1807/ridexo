import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  if (!q || q.trim().length < 2) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "ridexo-app/1.0",
        },
      }
    )
    const data = await res.json()

    const results = data.map((item: any) => ({
      id:      String(item.place_id),
      name:    item.display_name,
      country: item.address?.country,
      lat:     parseFloat(item.lat),
      lng:     parseFloat(item.lon),
    }))

    return NextResponse.json(results)

  } catch (error) {
    console.log("Geocode error:", error)
    return NextResponse.json([], { status: 200 })
  }
}