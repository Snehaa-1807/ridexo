'use client'

import React,{useState} from 'react'
import {useRouter} from 'next/navigation'
import {motion,AnimatePresence} from 'framer-motion'
import {
ArrowLeft,
Bike,
Car,
Truck,
CheckCircle,
ChevronRight,
LocateFixed,
MapPin,
Navigation,
Phone
} from 'lucide-react'

type vehicleType='bike'|'auto'|'car'|'loading'|'truck'

type Place={
id:string
name:string
country?:string
lat:number
lng:number
}

const VEHICLES=[
{id:'bike',label:'Bike',Icon:Bike,desc:'Quick & affordable'},
{id:'auto',label:'Auto',Icon:Car,desc:'Everyday rides'},
{id:'car',label:'Car',Icon:Car,desc:'Comfort rides'},
{id:'loading',label:'Loading',Icon:Truck,desc:'Small cargo'},
{id:'truck',label:'Truck',Icon:Truck,desc:'Heavy transport'},
]

export default function Page(){

const router=useRouter()

const [vehicle,setVehicle]=useState<vehicleType>()
const [mobile,setMobile]=useState('')
const [pickUp,setPickUp]=useState('')
const [drop,setDrop]=useState('')

const [pickUpCountry,setPickUpCountry]=useState('')
const [pickUpLat,setPickUpLat]=useState<number>()
const [pickUpLon,setPickUpLon]=useState<number>()

const [dropLat,setDropLat]=useState<number>()
const [dropLon,setDropLon]=useState<number>()

const [pickSuggestions,setPickSuggestions]=useState<Place[]>([])
const [dropSuggestions,setDropSuggestions]=useState<Place[]>([])

const [locating,setLocating]=useState(false)

const canContinue=
vehicle &&
mobile.length===10 &&
pickUp &&
drop &&
pickUpLat &&
pickUpLon &&
dropLat &&
dropLon

const progress=[
!!vehicle,
mobile.length===10,
!!pickUp,
!!drop
].filter(Boolean).length


const searchAddress = async (
  query: string,
  setResults: (r: Place[]) => void,
  restrict?: string
) => {
  try {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    // Nominatim — faster, no API key
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`,
      {
        headers: { "Accept-Language": "en", "User-Agent": "ridexo-app" },
        signal: AbortSignal.timeout(5000),
      }
    )
    const data = await res.json()

    let results: Place[] = data.map((item: any) => ({
      id:      String(item.place_id),
      name:    item.display_name,
      country: item.address?.country,
      lat:     parseFloat(item.lat),
      lng:     parseFloat(item.lon),
    }))

    if (restrict) {
      results = results.filter(r => r.country === restrict)
    }

    setResults(results)

  } catch (err) {
    console.log(err)
    setResults([])
  }
}


const useCurrentLocation=()=>{
if(!navigator.geolocation) return

setLocating(true)

navigator.geolocation.getCurrentPosition(
async({coords})=>{
try{

const res=await fetch(
`https://api.geoapify.com/v1/geocode/reverse?lat=${coords.latitude}&lon=${coords.longitude}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
)

const data=await res.json()

if(data.features?.length){
const p=data.features[0]

setPickUp(
p.properties.formatted
)

setPickUpCountry(
p.properties.country
)

setPickUpLat(coords.latitude)
setPickUpLon(coords.longitude)
setPickSuggestions([])
}

}catch(e){
console.log(e)
}

setLocating(false)
}
)
}



return(
<div className='min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10'>

<motion.div
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
className='w-full max-w-md'
>

<div className='flex items-center mb-6 gap-4'>

<button
onClick={()=>router.push('/')}
className='w-11 h-11 rounded-2xl bg-white border flex items-center justify-center'
>
<ArrowLeft size={18}/>
</button>

<div className='flex-1'>
<h1 className='text-xl font-black'>
Book a Ride
</h1>
<p className='text-xs text-zinc-400'>
Fill the details below
</p>
</div>

<div className='flex gap-2'>
{[0,1,2,3].map(i=>(
<div
key={i}
className={`h-2 rounded-full ${
i<progress
?'bg-green-600 w-6'
:'bg-zinc-300 w-2'
}`}
/>
))}
</div>

</div>


<div className='bg-white rounded-3xl shadow-xl p-6 space-y-7'>

{/* VEHICLES */}
<div>
<div className='flex items-center gap-2 mb-4'>
<div className='w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center'>
1
</div>
<p className='text-xs font-bold uppercase text-zinc-500'>
Choose Vehicle
</p>
</div>

<div className='grid grid-cols-2 gap-3'>
{VEHICLES.map(v=>{

const active=vehicle===v.id

return(
<div
key={v.id}
onClick={()=>setVehicle(v.id as vehicleType)}
className={`
p-4 rounded-2xl border cursor-pointer flex gap-3
${active
?'bg-black text-white'
:'bg-zinc-50'}
`}
>
<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
active?'bg-white':'bg-zinc-200'
}`}>
<v.Icon
size={18}
className={active?'text-black':'text-zinc-700'}
/>
</div>

<div>
<p className='font-bold'>
{v.label}
</p>
<p className='text-[11px] opacity-70'>
{v.desc}
</p>
</div>

</div>
)

})}
</div>
</div>


<div className='border-t'/>


{/* MOBILE */}
<div>

<div className='flex items-center gap-2 mb-4'>
<div className='w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center'>
2
</div>
<p className='text-xs font-bold uppercase text-zinc-500'>
Mobile
</p>
</div>

<div className='flex items-center gap-3 border rounded-2xl px-4 py-4'>
<Phone size={18}/>

<input
type='tel'
value={mobile}
maxLength={10}
onChange={(e)=>
setMobile(
e.target.value.replace(/\D/g,'')
)
}
placeholder='Mobile number'
className='flex-1 outline-none bg-transparent'
/>

{mobile.length===10 &&
<CheckCircle className='text-green-500'/>
}

</div>

</div>


<div className='border-t'/>



{/* ROUTE */}
<div>

<div className='flex items-center gap-2 mb-4'>
<div className='w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center'>
3
</div>

<p className='text-xs font-bold uppercase text-zinc-500'>
Route
</p>

</div>


<div className='border rounded-2xl overflow-visible'>

{/* PICKUP */}
<div className='relative z-50'>

<div className='flex items-center gap-3 px-4 py-4'>

<MapPin size={16}/>

<input
value={pickUp}
onChange={(e)=>{
setPickUp(e.target.value)
searchAddress(
e.target.value,
setPickSuggestions
)
}}
placeholder='Pickup location'
className='flex-1 outline-none'
/>

<button
onClick={useCurrentLocation}
className='w-9 h-9 rounded-xl bg-zinc-200 flex items-center justify-center'
>
<LocateFixed
size={15}
className={locating?'animate-spin':''}
/>
</button>

</div>


<AnimatePresence>
{pickSuggestions.length>0 &&(
<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
className='absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl overflow-hidden'
>

{pickSuggestions.map(p=>(
<div
key={p.id}
onClick={()=>{
setPickUp(p.name)
setPickUpCountry(p.country||'')
setPickUpLat(p.lat)
setPickUpLon(p.lng)
setPickSuggestions([])
}}
className='px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 cursor-pointer'
>
<MapPin size={14}/>
<span className='flex-1 text-sm'>
{p.name}
</span>
<ChevronRight size={14}/>
</div>
))}

</motion.div>
)}
</AnimatePresence>

</div>


<div className='border-t'/>


{/* DROP */}
<div className='relative z-40'>

<div className='flex items-center gap-3 px-4 py-4'>

<Navigation size={16}/>

<input
value={drop}
disabled={!pickUpCountry}
placeholder={
pickUpCountry
?'Drop location'
:'Select pickup first'
}
onChange={(e)=>{
setDrop(e.target.value)
searchAddress(
e.target.value,
setDropSuggestions,
pickUpCountry
)
}}
className='flex-1 outline-none bg-transparent'
/>

</div>


<AnimatePresence>
{dropSuggestions.length>0 &&(
<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
className='absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl overflow-hidden'
>

{dropSuggestions.map(p=>(
<div
key={p.id}
onClick={()=>{
setDrop(p.name)
setDropLat(p.lat)
setDropLon(p.lng)
setDropSuggestions([])
}}
className='px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 cursor-pointer'
>
<Navigation size={14}/>
<span className='flex-1 text-sm'>
{p.name}
</span>
<ChevronRight size={14}/>
</div>
))}

</motion.div>
)}
</AnimatePresence>

</div>

</div>

</div>



<button
disabled={!canContinue}
onClick={()=>{
  if (!pickUpLat || !pickUpLon || !dropLat || !dropLon) {
    alert('Please select valid pickup and drop locations with coordinates');
    return;
  }
  router.push(
    `/user/search?pickup=${encodeURIComponent(pickUp)}&drop=${encodeURIComponent(drop)}&vehicle=${vehicle}&mobile=${encodeURIComponent(mobile)}&pickuplat=${parseFloat(String(pickUpLat))}&pickuplon=${parseFloat(String(pickUpLon))}&droplat=${parseFloat(String(dropLat))}&droplon=${parseFloat(String(dropLon))}`
  )
}}
className='w-full h-14 rounded-2xl bg-black text-white font-bold disabled:opacity-40 hover:bg-zinc-900 transition'
>
Continue
</button>


</div>

</motion.div>

</div>
)

}