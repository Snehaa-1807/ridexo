'use client'

import React,{useEffect,useState} from 'react'
import {AnimatePresence} from 'framer-motion'
import {useRouter,useSearchParams} from 'next/navigation'
import {
ArrowLeft,
Zap,
Search,
RefreshCcw
} from 'lucide-react'
import dynamic from 'next/dynamic'
import axios from 'axios'
import VehicleCard from '@/components/VehicleCard'

const SearchMap=dynamic(
()=>import('@/components/SearchMap'),
{ssr:false}
)

type VehicleType=
'bike'|
'auto'|
'car'|
'loading'|
'truck'

interface IVehicle{
_id:string
owner:string
type:VehicleType
vehicleModel:string
number:string
imageUrl?:string
baseFare?:number
pricePerKM?:number
waitingCharge?:number
status:string
isActive:boolean
createdAt:Date
updatedAt:Date
}

export default function Page(){

const router=useRouter()
const params=useSearchParams()


/* DEBUG */
console.log({
pickup:params.get('pickup'),
pickuplat:params.get('pickuplat'),
pickuplon:params.get('pickuplon'),
vehicle:params.get('vehicle')
})


const [pickUp,setPickUp]=useState(
params.get('pickup') || ''
)

const [drop,setDrop]=useState(
params.get('drop') || ''
)

const mobile=
params.get('mobile') || ''


/* SAFE PARAM PARSING */
const pickUpLat=parseFloat(
params.get('pickuplat') || '0'
)

const pickUpLon=parseFloat(
params.get('pickuplon') || '0'
)

const dropLat=parseFloat(
params.get('droplat') || '0'
)

const dropLon=parseFloat(
params.get('droplon') || '0'
)


const [vehicleType]=useState<VehicleType>(
(params.get('vehicle') as VehicleType)
|| 'car'
)

const [distance,setDistance]=
useState<number>()

const [vehicles,setVehicles]=
useState<IVehicle[]>([])

const [loading,setLoading]=
useState(false)



const fetchVehicles=async()=>{

if(
isNaN(pickUpLat) ||
isNaN(pickUpLon) ||
pickUpLat===0 ||
pickUpLon===0
){
console.log(
'invalid coordinates',
pickUpLat,
pickUpLon
)
return
}

setLoading(true)

try{

console.log(
'Searching vehicles:',
{
latitude:pickUpLat,
longitude:pickUpLon,
vehicleType
}
)

const {data}=await axios.post(
'/api/vehicles/near-by',
{
latitude:pickUpLat,
longitude:pickUpLon,
vehicleType
}
)

console.log(
'Vehicle API response:',
data
)

setVehicles(
Array.isArray(data)
? data
: data.vehicles || []
)

}
catch(error){
console.log(error)
setVehicles([])
}
finally{
setLoading(false)
}

}



useEffect(()=>{

if(
!isNaN(pickUpLat) &&
!isNaN(pickUpLon) &&
pickUpLat!==0 &&
pickUpLon!==0
){
fetchVehicles()
}

},[
pickUpLat,
pickUpLon,
vehicleType
])



const handleBook=(v:IVehicle)=>{

const fare=
v.baseFare &&
v.pricePerKM &&
distance
?Math.round(
v.baseFare +
(v.pricePerKM*distance)
)
:0


router.push(
`/user/checkout?pickup=${encodeURIComponent(pickUp)}&drop=${encodeURIComponent(drop)}&mobile=${mobile}&pickuplat=${pickUpLat}&pickuplon=${pickUpLon}&droplat=${dropLat}&droplon=${dropLon}&fare=${fare}&vehicle=${v.type}&driverId=${v.owner}&vehicleId=${v._id}`
)

}



return(
<div className='min-h-screen bg-zinc-100'>

<div className='max-w-7xl mx-auto px-4 py-8'>

<button
onClick={()=>router.back()}
className='flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 mb-6'
>
<ArrowLeft size={16}/>
Back
</button>



<div className='grid lg:grid-cols-2 gap-6'>

{/* MAP */}
<div className='bg-white rounded-3xl border border-zinc-200 overflow-hidden h-[480px]'>

<SearchMap
pickUp={pickUp}
drop={drop}
onChange={(p,d)=>{
setPickUp(p)
setDrop(d)
}}
onDistance={(d)=>
setDistance(d)
}
/>

</div>



{/* VEHICLES */}
<div className='flex flex-col gap-4'>

<div className='flex items-center justify-between'>

<div>
<h2 className='text-2xl font-black text-zinc-900'>
Available Vehicles
</h2>

{distance&&(
<p className='text-sm text-zinc-400 font-medium mt-1'>
Distance:
{distance.toFixed(1)} km
</p>
)}

</div>


<button
onClick={fetchVehicles}
className='flex items-center gap-2 text-xs font-bold text-zinc-600 border border-zinc-200 px-3 py-2 rounded-xl hover:bg-zinc-50'
>
<RefreshCcw size={12}/>
Refresh
</button>

</div>



{loading?(
<div className='flex items-center justify-center h-40'>
<Search
size={30}
className='text-zinc-400 animate-pulse'
/>
</div>
)

:vehicles.length===0?(
<div className='flex flex-col items-center justify-center h-40 gap-3'>
<Zap
size={32}
className='text-zinc-300'
/>
<p className='text-zinc-400 font-medium'>
No vehicles found nearby
</p>
</div>
)

:(
<div className='grid gap-4 overflow-y-auto max-h-[600px] pr-1'>

<AnimatePresence>

{vehicles.map(v=>(
<VehicleCard
key={v._id}
vehicle={{
...v,
waitingCharge:
v.waitingCharge ?? 0
}}
distance={distance}
onBook={()=>
handleBook(v)
}
/>
))}

</AnimatePresence>

</div>
)}

</div>

</div>

</div>

</div>
)

}