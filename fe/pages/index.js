"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!regex.test(password)) {
      alert("Password minimal 6 karakter, harus ada huruf dan angka!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/register", { 
  username, 
  password 
});


      

      if (res.data.success) {
        alert("Registrasi berhasil!");
        router.push("/kategori"); 
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan pada server");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg min-h-[300px] flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-center text-black mt-4">Register</h2>

        <form onSubmit={handleRegister} className="flex flex-col gap-4 items-center">
          <div className="flex flex-col w-80 mx-auto">
            <label className="mb-1 text-sm font-semibold text-black">Username</label>
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
            <small className="text-xs text-gray-500 mt-1">
              Minimal 6 karakter, harus ada huruf dan angka
            </small>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="border-2 border-red-700 bg-red-700 text-white font-semibold text-sm px-6 py-5 rounded-md cursor-pointer w-32 text-center mt-4"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
