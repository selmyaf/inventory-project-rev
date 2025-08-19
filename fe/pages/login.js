"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
      "https://df7ba32be060.ngrok-free.app/login",
      { username, password }
    );
      if (res.data.success) {
        alert("Login berhasil!");
        router.push("/kategori");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
  if (err.response) {
    // Server balikin error (misal 400, 401, 500)
    alert(`❌ Error ${err.response.status}: ${err.response.data.message || "Terjadi kesalahan"}`);
  } else if (err.request) {
    // Request terkirim tapi server gak respon
    alert("⚠️ Server tidak merespon. Coba cek ngrok atau koneksi internet.");
  } else {
    // Error lain
    alert("⚡ Error: " + err.message);
  }
}

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg min-h-[300px] flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-center text-black mt-4">Login</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 items-center">
          <div className="flex flex-col w-80 mx-auto">
            <label className="mb-1 text-sm font-semibold text-black">sername</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-black px-4 py-3 h-14 rounded-md w-full text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex flex-col w-80 mx-auto relative">
            <label className="mb-1 text-sm font-semibold text-black">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-black px-4 py-3 h-14 rounded-md w-full text-sm font-semibold text-black pr-10"
              required
            />
            <span
              className="absolute right-3 top-11 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="border-2 border-red-700 bg-red-700 text-white font-semibold text-sm px-6 py-5 rounded-md cursor-pointer w-32 text-center mt-4"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
