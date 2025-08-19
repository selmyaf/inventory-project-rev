"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import $ from "jquery";
import "datatables.net-dt";
import Modal from "react-modal";

Modal.setAppElement("body");

export default function KategoriPage() {
  const [kategori, setKategori] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [namaKategori, setNamaKategori] = useState("");
  const [editId, setEditId] = useState(null);

  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  const fetchKategori = async () => {
    try {
      const res = await axios.get("https://89b809a86d32.ngrok-free.app/kategori");
      setKategori(res.data);
      if (dataTableRef.current) {
        dataTableRef.current.clear().rows.add(res.data).draw();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    dataTableRef.current = $(tableRef.current).DataTable({
      data: kategori,
      columns: [
        { title: "ID", data: "id_kategori" },
        { title: "Nama Kategori", data: "nama_kategori" },
        {
          title: "Aksi",
          data: null,
          render: (data, type, row) => {
            return `
              <button class="edit-btn text-blue-500 mr-2" data-id="${row.id_kategori}" data-nama="${row.nama_kategori}" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-btn text-red-500" data-id="${row.id_kategori}" title="Hapus">
                <i class="fas fa-trash-alt"></i>
              </button>
            `;
          },
        },
      ],
    });

    $(tableRef.current).on("click", ".edit-btn", function () {
      const id = $(this).data("id");
      const nama = $(this).data("nama");
      setEditId(id);
      setNamaKategori(nama);
      setModalOpen(true);
    });

    $(tableRef.current).on("click", ".delete-btn", async function () {
      const id = $(this).data("id");
      if (confirm("Yakin mau hapus kategori ini?")) {
        try {
          const res = await axios.delete(`https://89b809a86d32.ngrok-free.app/kategori/${id}`);

          if (!res.data.success) alert(res.data.message);
          fetchKategori();
        } catch (err) {
          console.error(err);
          alert("Terjadi kesalahan saat menghapus kategori");
        }
      }
    });

    fetchKategori();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaKategori.trim()) return alert("Nama kategori tidak boleh kosong!");

    try {
      if (editId) {
        await axios.put(`https://89b809a86d32.ngrok-free.app/kategori/${editId}`, { nama_kategori: namaKategori });
      } else {
        await axios.post("https://89b809a86d32.ngrok-free.app/kategori", { nama_kategori: namaKategori });
      }
      setNamaKategori("");
      setEditId(null);
      setModalOpen(false);
      fetchKategori();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan kategori");
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 mt-[100px]">
      <h2 className="title-kategori">Data Kategori</h2>

      <div className="flex justify-center mb-4">
        <button onClick={() => setModalOpen(true)} className="btn-tambah">
          <i className="fas fa-plus"></i> Tambah Kategori
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => {
          setModalOpen(false);
          setEditId(null);
          setNamaKategori("");
        }}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-xl mx-auto flex flex-col justify-center min-h-[300px]"
        overlayClassName="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex justify-center items-center"
      >
        <h3 className="text-3xl font-bold mb-8 text-center">
          {editId ? "Edit Kategori" : "Tambah Kategori"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center">
          <div className="flex flex-col w-96">
            <label className="mb-1 text-sm font-semibold text-black">Nama Kategori</label>
            <input
              type="text"
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              className="border-2 border-black px-4 py-3 h-14 rounded-md w-full text-sm font-semibold text-black"
              required
            />
          </div>

          <div className="flex gap-4 mt-6 justify-center">
            <button
              type="submit"
              className="border-2 border-red-700 bg-red-700 text-white font-semibold text-sm px-6 py-5 h-8 rounded-md cursor-pointer w-32 text-center"
            >
              {editId ? "Update" : "Tambah"}
            </button>

            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditId(null);
                setNamaKategori("");
              }}
              className="border-2 border-red-700 bg-white text-red-700 font-semibold text-sm px-6 py-5 h-8 rounded-md cursor-pointer w-32 text-center"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

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
