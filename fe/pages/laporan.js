"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import $ from "jquery";
import "datatables.net-dt";


export default function LaporanPage() {
  const [produk, setProduk] = useState([]);
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
  const res = await axios.get("https://e28f23332f61.ngrok-free.app/produk-laporan");
  setProduk(res.data);
};



  const exportExcel = () => {
    if (!produk.length) return alert("Data masih kosong!");
    const worksheet = XLSX.utils.json_to_sheet(
      produk.map(p => ({
        "Nama Produk": p.nama_produk,
        "Kategori": p.nama_kategori,
        "Kode": p.kode_produk,
        "Stok": p.jumlah_barang || 0
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produk");
    XLSX.writeFile(workbook, "laporan_produk.xlsx");
  };


const exportPDF = () => {
  if (!produk.length) return alert("Data masih kosong!");
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Laporan Produk", 105, 15, { align: "center" });

  autoTable(doc, {
    startY: 25,
    head: [["Nama Produk", "Kategori", "Kode", "Stok"]],
    body: produk.map(p => [
      p.nama_produk,
      p.nama_kategori,
      p.kode_produk,
      p.jumlah_barang || 0
    ]),
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [129, 0, 0], textColor: 255, halign: "center" },
    bodyStyles: { halign: "center" },
  });

  doc.save("laporan_produk.pdf");
};

  useEffect(() => {
    if (dataTableRef.current) {
      dataTableRef.current.clear().rows.add(produk).draw();
    } else {
      dataTableRef.current = $(tableRef.current).DataTable({
        data: produk,
        columns: [
          { title: "Nama Produk", data: "nama_produk" },
          { title: "Kategori", data: "nama_kategori" },
          { title: "Kode", data: "kode_produk" },
          { title: "Stok", data: "jumlah_barang", className: "text-center" }
        ],
      });
    }
  }, [produk]);

  return (
    <div className="p-6">
      <h2 className="title-kategori text-center mb-4">Laporan Produk</h2>

      <div className="flex justify-center space-x-8 mb-6">
  <button onClick={exportExcel} className="btn-excel">
    <i className="fas fa-file-excel"></i> Download Excel
  </button>
  <button onClick={exportPDF} className="btn-pdf">
    <i className="fas fa-file-pdf"></i> Download PDF
  </button>
</div>
<div className="flex justify-center mt-3">
  <div className="overflow-x-auto w-full max-w-4xl px-4">
    <table
      ref={tableRef}
      className="display w-full table-auto border-collapse border border-gray-200"
    ></table>
  </div>
</div>

    </div>
  );
}
