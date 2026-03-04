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

    console.log(formatted);

    const { data: insertedData, error } = await supabase
      .from("laporan_pajak")
      .insert(formatted);

    console.log("SUPABASE DATA:", insertedData);
    console.log("SUPABASE ERROR:", error);

    setExcelPreview(formatted);

  };

  reader.readAsArrayBuffer(file);

};
