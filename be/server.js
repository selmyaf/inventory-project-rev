const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

// --- Body parser ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "https://inventory-project-rev-git-main-sells-projects.vercel.app", // domain vercel kamu
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// --- Upload Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// --- MySQL Connection ---
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "inventory_db",
  port: 3306
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

// --- Static folder uploads ---
app.use("/uploads", express.static("uploads"));

// =======================
// AUTH ROUTES
// =======================
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password minimal 6 karakter & harus mengandung huruf & angka"
    });
  }

  const cekUser = "SELECT * FROM tbl_user WHERE nama_user = ?";
  db.query(cekUser, [username], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length > 0) return res.status(400).json({ success: false, message: "Username sudah digunakan" });

    const sql = "INSERT INTO tbl_user (nama_user, password) VALUES (?, ?)";
    db.query(sql, [username, password], (err2, result) => {
      if (err2) return res.status(500).json({ success: false, message: err2.message });

      res.json({ success: true, message: "Registrasi berhasil", user: { id: result.insertId, username } });
    });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM tbl_user WHERE nama_user = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) res.json({ success: true, user: results[0] });
    else res.json({ success: false, message: "Username atau password salah" });
  });
});

// =======================
// KATEGORI ROUTES
// =======================
app.get("/kategori", (req, res) => {
  db.query("SELECT * FROM tbl_kategori", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/kategori", (req, res) => {
  const { nama_kategori } = req.body;
  if (!nama_kategori || !nama_kategori.trim()) return res.status(400).json({ success: false, message: "Nama kategori wajib diisi" });

  db.query("SELECT * FROM tbl_kategori WHERE nama_kategori = ?", [nama_kategori.trim()], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length > 0) return res.status(400).json({ success: false, message: "Kategori sudah ada" });

    db.query("INSERT INTO tbl_kategori (nama_kategori) VALUES (?)", [nama_kategori.trim()], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: err2.message });
      res.json({ success: true, message: "Kategori berhasil ditambahkan" });
    });
  });
});

app.put("/kategori/:id", (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;
  db.query("UPDATE tbl_kategori SET nama_kategori = ? WHERE id_kategori = ?", [nama_kategori, id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true, message: "Kategori berhasil diupdate" });
  });
});

app.delete("/kategori/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM tbl_kategori WHERE id_kategori = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true, message: "Kategori berhasil dihapus" });
  });
});

// =======================
// PRODUK ROUTES
// =======================
app.get("/produk", (req, res) => {
  const sql = `
    SELECT p.*, k.nama_kategori
    FROM tbl_produk p
    JOIN tbl_kategori k ON p.id_kategori = k.id_kategori
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/produk", upload.array("foto_produk", 10), (req, res) => {
  const { id_kategori, nama_produk, kode_produk } = req.body;
  if (!req.files || req.files.length < 3) return res.status(400).json({ success: false, message: "Minimal 3 foto wajib diupload" });

  const foto = req.files.map(f => f.filename).join(",");
  const tgl_register = new Date();
  const sql = "INSERT INTO tbl_produk (id_kategori, nama_produk, kode_produk, foto_produk, tgl_register) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [id_kategori, nama_produk, kode_produk, foto, tgl_register], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true, message: "Produk berhasil ditambahkan" });
  });
});

app.put("/produk/:id", upload.array("foto_produk", 10), (req, res) => {
  const { id } = req.params;
  const { id_kategori, nama_produk, kode_produk } = req.body;

  db.query("SELECT foto_produk FROM tbl_produk WHERE id_produk = ?", [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (!results.length) return res.status(404).json({ message: "Produk tidak ditemukan" });

    let fotoLama = results[0].foto_produk;
    let fotoBaru = req.files && req.files.length > 0 ? req.files.map(f => f.filename).join(",") : fotoLama;

    db.query("UPDATE tbl_produk SET id_kategori=?, nama_produk=?, kode_produk=?, foto_produk=? WHERE id_produk=?", 
      [id_kategori, nama_produk, kode_produk, fotoBaru, id], 
      (err2) => {
        if (err2) return res.status(500).send(err2);
        res.json({ success: true, message: "Produk berhasil diupdate" });
      }
    );
  });
});

// =======================
// STOK ROUTES
// =======================
app.get('/stok', (req, res) => {
  const sql = `
    SELECT s.id_stok, p.nama_produk, s.jumlah_barang, s.tgl_update
    FROM tbl_stok s
    JOIN tbl_produk p ON s.id_produk = p.id_produk
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

app.post("/stok", (req, res) => {
  const { id_produk, jumlah_barang } = req.body;
  if (!id_produk || !jumlah_barang) return res.status(400).json({ error: "id_produk dan jumlah_barang wajib diisi" });

  db.query("SELECT * FROM tbl_produk WHERE id_produk = ?", [id_produk], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: "Produk tidak ditemukan" });

    db.query("INSERT INTO tbl_stok (id_produk, jumlah_barang, tgl_update) VALUES (?, ?, CURDATE())", [id_produk, jumlah_barang], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Stok berhasil ditambahkan" });
    });
  });
});

// =======================
// PRODUK LAPORAN
// =======================
app.get("/produk-laporan", (req, res) => {
  const sql = `
    SELECT p.id_produk, p.nama_produk, k.nama_kategori, p.kode_produk,
           IFNULL(s.jumlah_barang, 0) AS jumlah_barang
    FROM tbl_produk p
    JOIN tbl_kategori k ON p.id_kategori = k.id_kategori
    LEFT JOIN tbl_stok s ON p.id_produk = s.id_produk
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
