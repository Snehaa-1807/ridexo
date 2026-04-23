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
const pickUpIcon=new L.DivIcon({
html:`
<div style="
background:#16a34a;
color:white;
padding:8px 14px;
border-radius:999px;
font-size:12px;
font-weight:700;
box-shadow:0 4px 10px rgba(0,0,0,.15)">
Pickup
</div>
`,
className:'',
iconSize:[80,36]
})


/* LABELLED DROP MARKER */
const dropIcon=new L.DivIcon({
html:`
<div style="
background:#dc2626;
color:white;
padding:8px 14px;
border-radius:999px;
font-size:12px;
font-weight:700;
box-shadow:0 4px 10px rgba(0,0,0,.15)">
Drop
</div>
`,
className:'',
iconSize:[70,36]
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



const geoCoding=async(
q:string
):Promise<[number,number]|null>=>{

try{

const res=await fetch(
`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&limit=1&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
)

const data=await res.json()

if(!data.features?.length){
return null
}

const [lon,lat]=
data.features[0].geometry.coordinates

return [lat,lon]

}catch(e){
console.log(
'geocode error',
e
)
return null
}

}



const reverseGeoCoding=async(
lat:number,
lon:number
)=>{

try{

const res=await fetch(
`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
)

const data=await res.json()

if(!data.features?.length){
return null
}

return data.features[0].properties.formatted

}catch(e){
console.log(e)
return null
}

}



const loadRoute=async(
a:[number,number],
b:[number,number]
)=>{

try{

const res=await fetch(
`https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`
)

const data=await res.json()

console.log("route",data)

if(!data.routes?.length){
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
console.log(
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
<div className='relative h-full w-full'>

<MapContainer
center={
p1 || [23.2599,77.4126]
}
zoom={13}
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