"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import $ from "jquery";
import "datatables.net-dt";
import Modal from "react-modal";

Modal.setAppElement("body");

export default function StokPage() {
  const [stok, setStok] = useState([]);
  const [produk, setProduk] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [idProduk, setIdProduk] = useState("");
  const [jumlah, setJumlah] = useState("");

  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  // Ambil stok
  const fetchStok = async () => {
    try {
      const res = await axios.get("https://df7ba32be060.ngrok-free.app/stok");

      setStok(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Ambil produk untuk dropdown
  const fetchProduk = async () => {
    try {
      const res = await axios.get("https://df7ba32be060.ngrok-free.app/produk");

      console.log("Produk dropdown:", res.data);
      setProduk(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Tambah stok
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idProduk || !jumlah) return alert("Semua field wajib diisi!");
    try {
      await axios.post("https://df7ba32be060.ngrok-free.app/stok", {
        id_produk: idProduk,
        jumlah_barang: parseInt(jumlah, 10)
      });

      setIdProduk("");
      setJumlah("");
      setModalOpen(false);
      fetchStok();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan stok");
    }
  };

  useEffect(() => {
    fetchProduk();
    fetchStok();
  }, []);

  useEffect(() => {
    if (dataTableRef.current) {
      dataTableRef.current.clear().rows.add(stok).draw();
    } else {
      dataTableRef.current = $(tableRef.current).DataTable({
        data: stok,
        columns: [
          { title: "ID Stok", data: "id_stok" },
          { title: "Produk", data: "nama_produk" },
          { title: "Jumlah Barang", data: "jumlah_barang" },
          { title: "Tanggal Update", data: "tgl_update" }
        ]
      });
    }
  }, [stok]);

  return (
    <div className="container mx-auto px-6 py-6">
      <h2 className="title-kategori">Data Stok</h2>

      <div className="flex justify-center mb-4">
        <button onClick={() => setModalOpen(true)} className="btn-tambah">
          <i className="fas fa-plus"></i> Tambah Stok
        </button>
      </div>

      {/* Modal Tambah Stok */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => {
          setModalOpen(false);
          setIdProduk("");
          setJumlah("");
        }}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-xl mx-auto flex flex-col justify-center min-h-[300px]"
        overlayClassName="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex justify-center items-center"
      >
        <h3 className="text-3xl font-bold mb-8 text-center">Tambah Stok</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center">
          {/* Pilih Produk */}
          <div className="flex flex-col w-96">
            <label className="mb-1 text-sm font-semibold text-black">Produk</label>
            <select
              value={idProduk}
              onChange={(e) => setIdProduk(e.target.value)}
              className="border-2 border-black px-4 py-3 h-14 rounded-md w-full text-sm font-semibold text-black"
              required
            >
              <option value="">Pilih Produk</option>
              {produk.map((p) => (
                <option key={p.id_produk} value={p.id_produk}>
                  {p.nama_produk}
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah Barang */}
          <div className="flex flex-col w-96">
            <label className="mb-1 text-sm font-semibold text-black">Jumlah Barang</label>
            <input
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              className="border-2 border-black px-4 py-3 h-14 rounded-md w-full text-sm font-semibold text-black"
              required
            />
          </div>

          {/* Tombol */}
          <div className="flex gap-4 mt-6 justify-center">
            <button
              type="submit"
              className="border-2 border-red-700 bg-red-700 text-white font-semibold text-sm px-6 py-5 h-8 rounded-md cursor-pointer w-32 text-center"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setIdProduk("");
                setJumlah("");
              }}
              className="border-2 border-red-700 bg-white text-red-700 font-semibold text-sm px-6 py-5 h-8 rounded-md cursor-pointer w-32 text-center"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Tabel Stok */}
      <div className="flex justify-center mt-3">
        <div className="overflow-x-auto w-full max-w-4xl px-4">
          <table ref={tableRef} className="display w-full table-auto border-collapse border border-gray-200"></table>
        </div>
      </div>
    </div>
  );
}
