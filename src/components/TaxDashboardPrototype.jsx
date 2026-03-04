import { useState } from "react";
import * as XLSX from "xlsx";
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

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [reportYear, setReportYear] = useState("2026");

  const [businessType, setBusinessType] = useState("");

  const [consumers, setConsumers] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [activeDays, setActiveDays] = useState("");

  const [analysisHistory, setAnalysisHistory] = useState([]);

  const [excelData, setExcelData] = useState([]);

  const namaUsaha = "Contoh Restoran Nusantara";

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

  const filteredReports = reportData.filter((r) => r.tahun === reportYear);

  const totalDaily = consumers && minPayment ? consumers * minPayment : 0;
  const totalMonthly = totalDaily && activeDays ? totalDaily * activeDays : 0;
  const taxPotential = totalMonthly * 0.1;

  const selectedReport = reportData.find(
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

  const handleSearch = () => {
    if (!npwpd) return;
    setSearched(true);
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

  const handleExcelUpload = (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {

      const data = new Uint8Array(event.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formatted = jsonData.map((row) => ({
        tahun: String(row.Tahun),
        bulan: row.Bulan,
        omzet: Number(row["Omzet Lapor"]),
        pajak: Number(row["Pajak Lapor"])
      }));

      setExcelData(formatted);

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

                <Input placeholder="NPWPD" />
                <Input placeholder="Nama / Objek Pajak" />

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
                  Jenis Pajak : <b>{taxType}</b>
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
                </div>

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

                  {excelData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-3 text-center text-slate-400">
                        Belum ada data Excel yang diupload
                      </td>
                    </tr>
                  )}

                  {excelData.map((row,i)=>(
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

      </div>

    </div>
  );
}
