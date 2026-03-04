import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TaxDashboardPrototype() {
  const [npwpd, setNpwpd] = useState("");
  const [searched, setSearched] = useState(false);
  const [analysisPage, setAnalysisPage] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [reportYear, setReportYear] = useState("2026");

  const [businessType, setBusinessType] = useState("");

  const [consumers, setConsumers] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [activeDays, setActiveDays] = useState("");

  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [excelPreview, setExcelPreview] = useState([]);

  const [namaUsaha, setNamaUsaha] = useState("");
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    const { data } = await supabase
      .from("laporan_pajak")
      .select("*");

    if (data) {
      setExcelPreview(data);
    }

  };

  const showToast = (message, type = "success") => {

  setToast({ message, type });

  setTimeout(() => {
    setToast(null);
  }, 3000);

  };

  const businessTaxMap = {
    "PBJT - MAKANAN DAN/ATAU MINUMAN": "RESTORAN",
    "PBJT - JASA PERHOTELAN": "HOTEL",
    "PBJT - JASA KESENIAN DAN HIBURAN": "HIBURAN",
    "PBJT - JASA PARKIR": "PARKIR"
  };

  const taxType = businessTaxMap[businessType] || "-";

  const years = [];
  for (let y = 2010; y <= 2040; y++) years.push(String(y));

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value || 0);

  const reportData = [
    { tahun: "2026", bulan: "Januari", omzet: 150000000, pajak: 15000000 },
    { tahun: "2026", bulan: "Februari", omzet: 130000000, pajak: 13000000 },
    { tahun: "2026", bulan: "Maret", omzet: 140000000, pajak: 14000000 },
    { tahun: "2026", bulan: "April", omzet: 160000000, pajak: 16000000 }
  ];

  const dataSource = excelPreview.length > 0 ? excelPreview : reportData;
  const filteredReports = dataSource.filter((r) => r.tahun === reportYear);

  const totalDaily = consumers && minPayment ? consumers * minPayment : 0;
  const totalMonthly = totalDaily && activeDays ? totalDaily * activeDays : 0;
  const taxPotential = totalMonthly * 0.1;

  const selectedReport = dataSource.find(
  (r) => r.tahun === year && r.bulan === month
  );

  const pajakLaporTerakhir = selectedReport?.pajak ?? null;

  const selisihPajak =
    pajakLaporTerakhir !== null ? taxPotential - pajakLaporTerakhir : null;

  const persentaseSelisih =
    pajakLaporTerakhir !== null && pajakLaporTerakhir !== 0
      ? (selisihPajak / pajakLaporTerakhir) * 100
      : 0;

  let kategoriRisiko = "-";
  let warnaRisiko = "bg-slate-100 text-slate-600";

  if (pajakLaporTerakhir !== null) {
    if (persentaseSelisih > 30) {
      kategoriRisiko = "Tinggi";
      warnaRisiko = "bg-red-100 text-red-700";
    } else if (persentaseSelisih > 10) {
      kategoriRisiko = "Sedang";
      warnaRisiko = "bg-yellow-100 text-yellow-700";
    } else {
      kategoriRisiko = "Rendah";
      warnaRisiko = "bg-green-100 text-green-700";
    }
  }

  const handleSearch = async () => {

  const { data } = await supabase
    .from("laporan_pajak")
    .select("*")
    .eq("npwpd", npwpd);

  if (data && data.length > 0) {

    setNamaUsaha(data[0].nama_usaha);
    setExcelPreview(data);
    setSearched(true);

  }

};
  const resetSearch = () => {
    setNpwpd("");
    setSearched(false);
    setAnalysisPage(false);
  };

   const saveAnalysis = () => {
    if (!year || !month) return;

    const newHistory = {
      tahun: year,
      bulan: month,
      potensi: taxPotential,
      pajak_lapor: pajakLaporTerakhir,
      selisih: selisihPajak,
      risiko: kategoriRisiko
    };

    setAnalysisHistory((prev) => [...prev, newHistory]);
  };

  /* FUNGSI BACA EXCEL */
  const handleExcelUpload = async (e) => {

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async (event) => {

    const data = new Uint8Array(event.target.result);

    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(worksheet);

    const formatted = json.map((row)=>({
      npwpd: row.NPWPD,
      nama_usaha: row["Nama Usaha"],
      tahun: String(row.Tahun),
      bulan: row.Bulan,
      omzet: Number(row["Omzet Lapor"]),
      pajak: Number(row["Pajak Lapor"])
    }));

    console.log(formatted); // cek apakah data terbaca

    const { data, error } = await supabase
    .from("laporan_pajak")
    .insert(formatted);

    console.log("SUPABASE DATA:", data);
    console.log("SUPABASE ERROR:", error);
    }

    setExcelPreview(formatted);

  };

  reader.readAsArrayBuffer(file);

};

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* SIDEBAR */}
      <div
        className={`bg-white shadow-md border-r p-4 flex flex-col gap-4 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex justify-between items-center">
          {sidebarOpen && <h2 className="text-lg font-bold">Menu</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "◀" : "▶"}
          </Button>
        </div>

        {sidebarOpen && (
          <>
            <Button
              variant={!adminOpen ? "default" : "outline"}
              onClick={() => {
                setAdminOpen(false);
                setAnalysisPage(false);
              }}
            >
              Pencarian
            </Button>

            <Button
              variant={adminOpen ? "default" : "outline"}
              onClick={() => setAdminOpen(true)}
            >
              Admin
            </Button>
          </>
        )}
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col items-center p-8 gap-8">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-6xl text-center">
          <h1 className="text-2xl font-bold">Sistem Analisis Potensi Pajak</h1>
          <p className="text-sm text-slate-500">
            Monitoring Potensi Pajak Usaha Daerah
          </p>
        </div>

        {/* ADMIN PAGE */}
        {adminOpen && (
          <div className="w-full max-w-5xl flex flex-col gap-6">

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Upload Master Data Objek Pajak (Excel)
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
              <Input
              placeholder="NPWPD"
              value={npwpd}
              onChange={(e) => setNpwpd(e.target.value)}
            />
          
            <Input
              placeholder="Nama / Objek Pajak"
              value={namaUsaha}
              onChange={(e) => setNamaUsaha(e.target.value)}
            />

                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Jenis Usaha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PBJT - MAKANAN DAN/ATAU MINUMAN">PBJT - MAKANAN DAN/ATAU MINUMAN</SelectItem>
                    <SelectItem value="PBJT - JASA PERHOTELAN">PBJT - JASA PERHOTELAN</SelectItem>
                    <SelectItem value="PBJT - JASA KESENIAN DAN HIBURAN">PBJT - JASA KESENIAN DAN HIBURAN</SelectItem>
                    <SelectItem value="PBJT - JASA PARKIR">PBJT - JASA PARKIR</SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-sm text-slate-500">
                  Jenis Pajak otomatis: <b>{taxType}</b>
                </div>

                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                  />
                  <p className="text-xs text-slate-500">
                    Format Excel: Tahun | Bulan | Omzet Lapor | Pajak Lapor
                  </p>
                  <Button variant="outline" className="w-full">
                    Download Template Excel
                  </Button>
                </div>

                <Button className="w-full">Upload Master Data</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview Data Excel (Multi Tahun)</CardTitle>
              </CardHeader>

              <CardContent>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left">Tahun</th>
                      <th className="p-3 text-left">Bulan</th>
                      <th className="p-3 text-left">Omzet Lapor</th>
                      <th className="p-3 text-left">Pajak Lapor</th>
                    </tr>
                  </thead>

                  <tbody>

                  {excelPreview.length === 0 && (
                  <tr>
                  <td colSpan="4" className="p-3 text-center text-slate-400">
                  Belum ada data Excel
                  </td>
                  </tr>
                  )}

                  {excelPreview.map((row,i)=>(
                  <tr key={i} className="border-b">
                  <td className="p-3">{row.tahun}</td>
                  <td className="p-3">{row.bulan}</td>
                  <td className="p-3">{formatRupiah(row.omzet)}</td>
                  <td className="p-3">{formatRupiah(row.pajak)}</td>
                  </tr>
                  ))}

                  </tbody>
                </table>
              </CardContent>
            </Card>

          </div>
        )}

        {/* SEARCH */}
        {!adminOpen && !analysisPage && !searched && (
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Pencarian Objek Pajak
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <Input
                className="h-12 text-base"
                placeholder="Masukkan NPWPD"
                value={npwpd}
                onChange={(e) => setNpwpd(e.target.value)}
              />

              <Button className="w-full h-12 text-base" onClick={handleSearch}>
                Cari Data Usaha
              </Button>
            </CardContent>
          </Card>
        )}

        {/* RESULT */}
        {!adminOpen && !analysisPage && searched && (
          <div className="w-full max-w-6xl flex flex-col gap-6">

            <Card>
              <CardHeader>
                <CardTitle>Informasi Objek Pajak</CardTitle>
              </CardHeader>

              <CardContent className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-slate-500">NPWPD</div>
                  <div className="font-semibold">{npwpd}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Objek Pajak</div>
                  <div className="font-semibold">{namaUsaha}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Jenis Usaha</div>
                  <div className="font-semibold">{businessType || "-"}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Jenis Pajak</div>
                  <div className="font-semibold">{taxType}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Laporan Pajak Per Tahun</CardTitle>

                <Select value={reportYear} onValueChange={setReportYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>

              <CardContent>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left">Bulan</th>
                      <th className="p-3 text-left">Omzet Lapor</th>
                      <th className="p-3 text-left">Pajak Lapor</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">{row.bulan}</td>
                        <td className="p-3">{formatRupiah(row.omzet)}</td>
                        <td className="p-3">{formatRupiah(row.pajak)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetSearch}>Cari Objek Pajak Lain</Button>
              <Button onClick={() => setAnalysisPage(true)}>Buka Analisis Potensi Pajak</Button>
            </div>

          </div>
        )}

        {/* ANALYSIS */}
        {!adminOpen && analysisPage && (
          <div className="w-full max-w-6xl flex flex-col gap-6">

            <Card>
              <CardHeader>
                <CardTitle>Parameter Analisis</CardTitle>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-5">

                {year && month && pajakLaporTerakhir === null && (
                  <div className="md:col-span-2 bg-yellow-100 text-yellow-800 p-3 rounded-lg text-sm">
                    ⚠ Data pajak lapor untuk periode ini belum tersedia.
                  </div>
                )}

                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input type="number" placeholder="Jumlah Konsumen per Hari" value={consumers} onChange={(e) => setConsumers(e.target.value)} />
                <Input type="number" placeholder="Pembayaran Minimal" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} />
                <Input type="number" placeholder="Hari Aktif" value={activeDays} onChange={(e) => setActiveDays(e.target.value)} />

                <div className="md:col-span-2 grid md:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="text-xs text-slate-500">Total Omzet / Hari</div>
                    <div className="text-lg font-bold">{formatRupiah(totalDaily)}</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="text-xs text-slate-500">Total Omzet / Bulan</div>
                    <div className="text-lg font-bold">{formatRupiah(totalMonthly)}</div>
                  </div>

                  <div className="p-4 bg-green-100 rounded-xl">
                    <div className="text-xs">Potensi Pajak</div>
                    <div className="text-lg font-bold text-green-700">{formatRupiah(taxPotential)}</div>
                  </div>
                </div>

                <div className="md:col-span-2 grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-yellow-100 rounded-xl">
                    <div className="text-xs">Pajak Lapor</div>
                    <div className="text-lg font-bold">{pajakLaporTerakhir !== null ? formatRupiah(pajakLaporTerakhir) : "-"}</div>
                  </div>

                  <div className="p-4 bg-red-100 rounded-xl">
                    <div className="text-xs">Selisih Pajak</div>
                    <div className="text-lg font-bold text-red-700">{selisihPajak !== null ? formatRupiah(selisihPajak) : "-"}</div>
                  </div>

                  <div className={`p-4 rounded-xl ${warnaRisiko}`}>
                    <div className="text-xs">Risiko</div>
                    <div className="text-lg font-bold">{kategoriRisiko}</div>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <Button onClick={saveAnalysis} className="flex-1">Simpan ke Riwayat Analisis</Button>
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Riwayat Analisis</CardTitle>
              </CardHeader>

              <CardContent>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left">Tahun</th>
                      <th className="p-3 text-left">Bulan</th>
                      <th className="p-3 text-left">Potensi</th>
                      <th className="p-3 text-left">Pajak Lapor</th>
                      <th className="p-3 text-left">Selisih</th>
                      <th className="p-3 text-left">Risiko</th>
                    </tr>
                  </thead>

                  <tbody>
                    {analysisHistory.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">{row.tahun}</td>
                        <td className="p-3">{row.bulan}</td>
                        <td className="p-3">{formatRupiah(row.potensi)}</td>
                        <td className="p-3">{row.pajak_lapor !== null ? formatRupiah(row.pajak_lapor) : "-"}</td>
                        <td className="p-3">{row.selisih !== null ? formatRupiah(row.selisih) : "-"}</td>
                        <td className="p-3">{row.risiko}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetSearch}>Cari Objek Pajak Lain</Button>
              <Button variant="outline" onClick={() => setAnalysisPage(false)}>Kembali</Button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
