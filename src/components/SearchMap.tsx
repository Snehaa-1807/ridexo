'use client'

import React,{useEffect,useState} from 'react'
import L from 'leaflet'
import {
MapContainer,
Marker,
Polyline,
TileLayer,
useMap
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

import {AnimatePresence,motion} from 'framer-motion'
import {MapPin,Navigation2} from 'lucide-react'


/* FIX MARKER ICONS IN NEXT */
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
iconRetinaUrl:
'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
iconUrl:
'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
shadowUrl:
'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})


type Props={
pickUp:string
drop:string
onChange:(p:string,d:string)=>void
onDistance:(d:number)=>void
}


function FitBounds({
p1,
p2
}:{
p1:[number,number],
p2:[number,number]
}){

const map=useMap()

useEffect(()=>{

map.invalidateSize()

map.fitBounds(
[p1,p2],
{
padding:[70,70],
maxZoom:15,
animate:true
}
)

},[
map,
p1,
p2
])

return null
}



/* LABELLED PICKUP MARKER */
const pickUpIcon = new L.DivIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.28))">

      <div style="
        background:#0a0a0a;
        color:#fff;
        padding:5px 13px;
        border-radius:100px;
        font-size:10px;
        font-weight:800;
        letter-spacing:0.1em;
        text-transform:uppercase;
        white-space:nowrap;
        font-family:system-ui"
      >
        PICKUP
      </div>

      <div style="width:2px;height:9px;background:#0a0a0a"></div>

      <div style="
        width:10px;
        height:10px;
        background:#0a0a0a;
        border-radius:50%;
        border:2.5px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.3)"
      >
      </div>

    </div>
  `,

  className: "",

  iconSize: [90, 58],

  iconAnchor: [45, 58]

})


/* LABELLED DROP MARKER */
const dropIcon = new L.DivIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.28))">

      <div style="
        background:#dc2626;
        color:#fff;
        padding:5px 13px;
        border-radius:100px;
        font-size:10px;
        font-weight:800;
        letter-spacing:0.1em;
        text-transform:uppercase;
        white-space:nowrap;
        font-family:system-ui"
      >
        DROP
      </div>

      <div style="width:2px;height:9px;background:#dc2626"></div>

      <div style="
        width:10px;
        height:10px;
        background:#dc2626;
        border-radius:50%;
        border:2.5px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.3)"
      >
      </div>

    </div>
  `,

  className: "",

  iconSize: [90, 58],

  iconAnchor: [45, 58]

})


export default function SearchMap({
pickUp,
drop,
onChange,
onDistance
}:Props){

const [p1,setP1]=useState<[number,number]>()
const [p2,setP2]=useState<[number,number]>()
const [route,setRoute]=useState<[number,number][]>([])
const [km,setKm]=useState<number|null>(null)
const [ready,setReady]=useState(false)


const geoCoding = async (q: string): Promise<[number, number] | null> => {
  try {
    if (!q || q.trim().length === 0) return null

    // Use our proxy API — no CORS issues
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
    const data = await res.json()

    if (data?.length) {
      console.log("coords for", q, [data[0].lat, data[0].lng])
      return [data[0].lat, data[0].lng]
    }

    return null
  } catch (e) {
    console.error("geocode error", e)
    return null
  }
}



const reverseGeoCoding=async(
lat:number,
lon:number
)=>{

try{

if(isNaN(lat) || isNaN(lon)) return null

const res=await fetch(
`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`,
{ signal: AbortSignal.timeout(5000) }
)

const data=await res.json()

if(!data.features?.length){
return null
}

return data.features[0].properties.formatted

}catch(e){
console.error('reverse geocode error:', e)
return null
}

}



const loadRoute=async(
a:[number,number],
b:[number,number]
)=>{

try{

if(isNaN(a[0]) || isNaN(a[1]) || isNaN(b[0]) || isNaN(b[1])) {
setReady(true)
return
}

const res=await fetch(
`https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`,
{ signal: AbortSignal.timeout(8000) }
)

const data=await res.json()

if(!data.routes?.length){
console.warn('No route found')
setReady(true)
return
}

const coords=
data.routes[0].geometry.coordinates.map(
([lon,lat]:number[])=>[
lat,
lon
]
)

setRoute(coords)

const distance=
+(data.routes[0].distance/1000).toFixed(2)

setKm(distance)

onDistance(distance)

setReady(true)

}catch(e){
console.error(
'route error',
e
)
setReady(true)
}

}



const dragPickUp=async(
lat:number,
lon:number
)=>{
setP1([lat,lon])

const addr=
await reverseGeoCoding(
lat,
lon
)

if(p2){
await loadRoute(
[lat,lon],
p2
)
}

onChange(
addr||pickUp,
drop
)

}



const dragDrop=async(
lat:number,
lon:number
)=>{
setP2([lat,lon])

const addr=
await reverseGeoCoding(
lat,
lon
)

if(p1){
await loadRoute(
p1,
[lat,lon]
)
}

onChange(
pickUp,
addr||drop
)

}



/* ROUTE LOADING */
useEffect(()=>{

setReady(false)

if(
!pickUp ||
!drop
){
setReady(true)
return
}

;(async()=>{

try{

const a=
await geoCoding(
pickUp
)

const b=
await geoCoding(
drop
)

console.log(
'pickup coords',
a
)

console.log(
'drop coords',
b
)

if(!a || !b){
setReady(true)
return
}

setP1(a)
setP2(b)

await loadRoute(
a,
b
)

}catch(e){
console.log(e)
setReady(true)
}

})()

},[
pickUp,
drop
])



return(
<div className='relative h-full w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100'>

{!p1 && !p2 && (
  <div className='absolute inset-0 flex items-center justify-center z-40 pointer-events-none'>
    <div className='text-center'>
      <MapPin className='mx-auto mb-3 text-zinc-400' size={40} />
      <p className='text-sm text-zinc-500 font-medium'>
        Enter pickup and drop location to see route
      </p>
    </div>
  </div>
)}

<MapContainer
center={
p1 || [23.2599,77.4126]
}
zoom={p1 && p2 ? 13 : 11}
style={{
height:'100%',
width:'100%'
}}
zoomControl={false}
>

<TileLayer
url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
/>


{p1&&p2&&(
<FitBounds
p1={p1}
p2={p2}
/>
)}


{p1&&(
<Marker
position={p1}
icon={pickUpIcon}
draggable
eventHandlers={{
dragend:e=>{
const m=
e.target.getLatLng()

dragPickUp(
m.lat,
m.lng
)
}
}}
/>
)}


{p2&&(
<Marker
position={p2}
icon={dropIcon}
draggable
eventHandlers={{
dragend:e=>{
const m=
e.target.getLatLng()

dragDrop(
m.lat,
m.lng
)
}
}}
/>
)}



{route.length>0&&(
<Polyline
positions={route}
pathOptions={{
color:'#111',
weight:5
}}
/>
)}

</MapContainer>



<AnimatePresence>
{!ready&&(
<motion.div
initial={{opacity:1}}
exit={{opacity:0}}
className='absolute inset-0 bg-white/90 backdrop-blur flex items-center justify-center z-50'
>
<div className='text-center'>
<MapPin className='mx-auto mb-3'/>
<p className='font-bold text-sm'>
Loading Route...
</p>
</div>
</motion.div>
)}
</AnimatePresence>



<AnimatePresence>
{ready && km &&(
<motion.div
initial={{
opacity:0,
y:10
}}
animate={{
opacity:1,
y:0
}}
className='absolute bottom-20 left-4 z-50 bg-white rounded-xl shadow-lg px-4 py-3 flex gap-3'
>
<Navigation2 size={15}/>
<span>
{km} km
</span>
<span>
~ {
Math.max(
5,
Math.round((km/25)*60)
)
} min
</span>
</motion.div>
)}
</AnimatePresence>

</div>
)

}