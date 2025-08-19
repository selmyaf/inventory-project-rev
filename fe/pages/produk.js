"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net";
import Modal from "react-modal";

Modal.setAppElement("body");

export default function ProdukPage() {
  const [produk, setProduk] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    id_kategori: "",
    nama_produk: "",
    kode_produk: "",
    foto_produk: [], 
    foto_produk_lama: [], 
  });

  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchProduk();
    fetchKategori();
  }, []);

  const fetchProduk = async () => {
    try {
      const res = await axios.get("https://89b809a86d32.ngrok-free.app/produk");
      setProduk(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await axios.get("https://89b809a86d32.ngrok-free.app/kategori");

      setKategori(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      foto_produk: [...formData.foto_produk, ...e.target.files],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("id_kategori", formData.id_kategori);
    fd.append("nama_produk", formData.nama_produk);
    fd.append("kode_produk", formData.kode_produk);

    if (formData.foto_produk.length > 0) {
      for (let i = 0; i < formData.foto_produk.length; i++) {
        fd.append("foto_produk", formData.foto_produk[i]);
      }
    }

    try {
      if (isEdit && editId) {
  await axios.put(`https://89b809a86d32.ngrok-free.app/produk/${editId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
} else {
  await axios.post("https://89b809a86d32.ngrok-free.app/produk", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

      setFormData({
        id_kategori: "",
        nama_produk: "",
        kode_produk: "",
        foto_produk: [],
        foto_produk_lama: [],
      });
      setIsEdit(false);
      setEditId(null);
      setModalIsOpen(false);
      fetchProduk();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data produk!");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id_kategori: item.id_kategori,
      nama_produk: item.nama_produk,
      kode_produk: item.kode_produk,
      foto_produk: [], 
      foto_produk_lama: item.foto_produk ? item.foto_produk.split(",") : [], // preview lama
    });
    setIsEdit(true);
    setEditId(item.id_produk);
    setModalIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin mau hapus produk ini?")) {
      try {

        await axios.delete(`https://89b809a86d32.ngrok-free.app/produk/${id}`);

        fetchProduk();
      } catch (err) {
        console.error(err);
        alert("Gagal menghapus produk!");
      }
    }
  };

  useEffect(() => {
    if (produk.length && tableRef.current) {
      if (dataTableRef.current) dataTableRef.current.destroy();

      dataTableRef.current = $(tableRef.current).DataTable({
        data: produk,
        columns: [
          { title: "Nama Produk", data: "nama_produk" },
          { title: "Kategori", data: "nama_kategori" },
          { title: "Kode", data: "kode_produk" },
          {
  title: "Foto",
  data: "foto_produk",
  render: (data) => {
    if (!data) return "";
    const files = data.split(",");
    return files
      .map( 
        (f) =>
  `<img src="https://89b809a86d32.ngrok-free.app/uploads/${f.trim()}" class="w-16 h-16 inline-block mr-1 rounded" />`
)
.join("");

  },
},

          {
            title: "Aksi",
            data: null,
            render: (row) => `
              <button class="edit-btn text-blue-500 mr-2" data-id="${row.id_produk}"><i class="fas fa-edit"></i></button>
            `,
          },
        ],
      });

      $(tableRef.current).on("click", ".edit-btn", function () {
        const id = $(this).data("id");
        const item = produk.find((p) => p.id_produk === id);
        handleEdit(item);
      });

      $(tableRef.current).on("click", ".delete-btn", function () {
        const id = $(this).data("id");
        handleDelete(id);
      });
    }
  }, [produk]);

  return (
    <div className="p-6">
      <div className="flex flex-col items-center gap-3 mb-6">
        <h2 className="title-kategori">Data Produk</h2>
        <button onClick={() => setModalIsOpen(true)} className="btn-tambah">
          <i className="fas fa-plus"></i> Tambah Produk
        </button>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-xl mx-auto flex flex-col justify-center min-h-[600px]"
        overlayClassName="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex justify-center items-center"
      >
        <h3 className="text-3xl font-bold mb-8 text-center">
          {isEdit ? "Edit Produk" : "Tambah Produk"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center">
      
          <div className="flex flex-col w-96">
            <label className="mb-1 text-sm font-semibold text-black">Kategori</label>
            <select
              value={formData.id_kategori}
              onChange={(e) => setFormData({ ...formData, id_kategori: e.target.value })}
              className="border-2 border-black px-4 py-3 h-14 rounded-md w-full text-sm font-semibold text-black"
              required
            >
              <option value="">Pilih Kategori</option>
              {kategori.map((kat) => (
                <option key={kat.id_kategori} value={kat.id_kategori}>
                  {kat.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-96">
            <label className="mb-1 text-sm font-semibold text-black">Nama Produk</label>
            <input
              type="text"
              value={formData.nama_produk}
              onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
              className="border-2 border-black px-4 py-3 h-14 rounded-md w-full text-sm font-semibold text-black"
              required
            />
          </div>

          <div className="flex flex-col w-96">
            <label className="mb-1 text-sm font-semibold text-black">Kode Produk</label>
            <input
              type="text"
              value={formData.kode_produk}
              onChange={(e) => setFormData({ ...formData, kode_produk: e.target.value })}
              className="border-2 border-black px-4 py-3 h-14 rounded-md w-full text-sm font-semibold text-black"
              required
            />
          </div>

          <div className="flex flex-col w-96">
            <label className="mb-1 text-sm font-semibold text-black">Pilih File</label>
            <label className="border-2 border-green-600 bg-green-600 text-white font-semibold text-sm px-4 py-3 h-6 rounded-md text-center cursor-pointer w-30">
              Choose File
              <input type="file" multiple onChange={handleFileChange} className="hidden" />
            </label>

            {formData.foto_produk.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {formData.foto_produk.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx}`}
                    className="w-16 h-16 rounded object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {isEdit && formData.foto_produk_lama.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {formData.foto_produk_lama.map((f, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:5000/uploads/${f}`}
                  alt={`Foto lama ${idx}`}
                  className="w-16 h-16 rounded object-cover"
                />
              ))}
            </div>
          )}

          <div className="flex gap-4 mt-6 justify-center">
            <button
              type="submit"
              className="border-2 border-red-700 bg-red-700 text-white font-semibold text-sm px-6 py-5 h-8 rounded-md cursor-pointer w-32 text-center"
            >
              {isEdit ? "Update" : "Tambah"}
            </button>
            <button
              type="button"
              onClick={() => {
                setModalIsOpen(false);
                setIsEdit(false);
                setEditId(null);
                setFormData({
                  id_kategori: "",
                  nama_produk: "",
                  kode_produk: "",
                  foto_produk: [],
                  foto_produk_lama: [],
                });
              }}
              className="border-2 border-red-700 bg-white text-red-700 font-semibold text-sm px-6 py-5 rounded-md cursor-pointer w-32 text-center"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      <div className="flex justify-center mt-4">
        <div className="overflow-x-auto w-full max-w-5xl px-4">
          <table ref={tableRef} className="display w-full"></table>
        </div>
      </div>
    </div>
  );
}