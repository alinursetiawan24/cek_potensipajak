
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.jsx";
import { Input } from "./ui/input.jsx";
import { Button } from "./ui/button.jsx";
import { Select, SelectItem, SelectValue } from "./ui/select.jsx";

export default function TaxDashboardPrototype(){

const [npwpd,setNpwpd]=useState("")
const [searched,setSearched]=useState(false)
const [analysisPage,setAnalysisPage]=useState(false)

const [year,setYear]=useState("")
const [month,setMonth]=useState("")

const [consumers,setConsumers]=useState("")
const [minPayment,setMinPayment]=useState("")
const [activeDays,setActiveDays]=useState("")

const years=[]
for(let y=2010;y<=2040;y++) years.push(String(y))

const formatRupiah=(v)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v||0)

const totalDaily=consumers&&minPayment?consumers*minPayment:0
const totalMonthly=totalDaily&&activeDays?totalDaily*activeDays:0
const taxPotential=totalMonthly*0.1

const pajakLapor=14000000
const selisih=taxPotential-pajakLapor

let risiko="-"
let warna="bg-slate-100"
const persen=(selisih/pajakLapor)*100

if(persen>30){risiko="Tinggi";warna="bg-red-100 text-red-700"}
else if(persen>10){risiko="Sedang";warna="bg-yellow-100 text-yellow-700"}
else if(persen>=0){risiko="Rendah";warna="bg-green-100 text-green-700"}

return(
<div className="min-h-screen bg-slate-100 flex flex-col items-center p-8 gap-8">

<div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-6xl text-center">
<h1 className="text-2xl font-bold">Sistem Analisis Potensi Pajak</h1>
</div>

{!searched && (
<Card className="w-full max-w-4xl">
<CardHeader><CardTitle className="text-center">Pencarian Objek Pajak</CardTitle></CardHeader>
<CardContent className="space-y-4">
<Input placeholder="Masukkan NPWPD" value={npwpd} onChange={(e)=>setNpwpd(e.target.value)}/>
<Button onClick={()=>setSearched(true)} className="w-full">Cari Data Usaha</Button>
</CardContent>
</Card>
)}

{searched && !analysisPage && (
<div className="flex flex-col gap-6 w-full max-w-6xl">

<Card>
<CardHeader><CardTitle>Informasi Objek Pajak</CardTitle></CardHeader>
<CardContent>{npwpd}</CardContent>
</Card>

<Button onClick={()=>setAnalysisPage(true)}>Buka Analisis</Button>

</div>
)}

{analysisPage && (
<div className="w-full max-w-6xl flex flex-col gap-6">

<Card>
<CardHeader><CardTitle>Analisis</CardTitle></CardHeader>
<CardContent className="grid md:grid-cols-2 gap-4">

<Select value={year} onValueChange={setYear}>
<SelectValue placeholder="Pilih Tahun"/>
{years.map(y=><SelectItem key={y} value={y}>{y}</SelectItem>)}
</Select>

<Select value={month} onValueChange={setMonth}>
<SelectValue placeholder="Pilih Bulan"/>
{["Januari","Februari","Maret"].map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}
</Select>

<Input type="number" placeholder="Jumlah Konsumen" value={consumers} onChange={(e)=>setConsumers(e.target.value)}/>
<Input type="number" placeholder="Pembayaran Minimal" value={minPayment} onChange={(e)=>setMinPayment(e.target.value)}/>
<Input type="number" placeholder="Hari Aktif" value={activeDays} onChange={(e)=>setActiveDays(e.target.value)}/>

<div className="grid grid-cols-5 gap-3 col-span-2">

<div className="p-3 bg-slate-50 rounded">
<p className="text-xs">Omzet/Hari</p>
<p className="font-bold">{formatRupiah(totalDaily)}</p>
</div>

<div className="p-3 bg-slate-50 rounded">
<p className="text-xs">Omzet/Bulan</p>
<p className="font-bold">{formatRupiah(totalMonthly)}</p>
</div>

<div className="p-3 bg-green-100 rounded">
<p className="text-xs">Potensi</p>
<p className="font-bold">{formatRupiah(taxPotential)}</p>
</div>

<div className="p-3 bg-red-100 rounded">
<p className="text-xs">Selisih</p>
<p className="font-bold">{formatRupiah(selisih)}</p>
</div>

<div className={`p-3 rounded ${warna}`}>
<p className="text-xs">Risiko</p>
<p className="font-bold">{risiko}</p>
</div>

</div>

</CardContent>
</Card>

</div>
)}

</div>
)
}
