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

  // ambil data dari API
  const fetchKategori = async () => {
    try {
      const res = await axios.get("http://localhost:5000/kategori");
      setKategori(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  // init DataTable sekali, lalu update kalau kategori berubah
  useEffect(() => {
    if (dataTableRef.current) {
      dataTableRef.current.clear().rows.add(kategori).draw();
    } else {
      dataTableRef.current = $(tableRef.current).DataTable({
        data: kategori,
        columns: [
          { title: "ID", data: "id_kategori" },
          { title: "Nama Kategori", data: "nama_kategori" },
          {
            title: "Aksi",
            data: null,
            render: (data, type, row) => `
              <button class="edit-btn text-blue-500 mr-2" data-id="${row.id_kategori}" data-nama="${row.nama_kategori}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-btn text-red-500" data-id="${row.id_kategori}">
                <i class="fas fa-trash-alt"></i>
              </button>
            `,
          },
        ],
      });

      // event edit
      $(tableRef.current).on("click", ".edit-btn", function () {
        const id = $(this).data("id");
        const nama = $(this).data("nama");
        setEditId(id);
        setNamaKategori(nama);
        setModalOpen(true);
      });

      // event delete
      $(tableRef.current).on("click", ".delete-btn", async function () {
        const id = $(this).data("id");
        if (confirm("Yakin mau hapus kategori ini?")) {
          try {
            await axios.delete(`http://localhost:5000/kategori/${id}`);
            fetchKategori(); // refresh data
          } catch (err) {
            console.error(err);
            alert("Gagal hapus kategori");
          }
        }
      });
    }
  }, [kategori]);

  // submit form tambah/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaKategori.trim()) return alert("Nama kategori tidak boleh kosong!");

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/kategori/${editId}`, {
          nama_kategori: namaKategori,
        });
      } else {
        await axios.post("http://localhost:5000/kategori", {
          nama_kategori: namaKategori,
        });
      }
      setNamaKategori("");
      setEditId(null);
      setModalOpen(false);
      fetchKategori(); // refresh
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan kategori");
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 mt-[100px]">
      <h2 className="title-kategori text-center mb-4">Data Kategori</h2>

      <div className="flex justify-center mb-4">
        <button onClick={() => setModalOpen(true)} className="btn-tambah">
          <i className="fas fa-plus"></i> Tambah Kategori
        </button>
      </div>

      {/* modal tambah/edit */}
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
            <label className="mb-1 text-sm font-semibold text-black">
              Nama Kategori
            </label>
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

      {/* tabel */}
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
