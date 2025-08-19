"use client";
import { useRouter } from "next/router"; 

export default function Header() {
  const router = useRouter();
  const pathname = router.pathname; 

  if (pathname === "/login") {
    return null;
  }


  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50 h-20">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        
        {/* Menu Tengah */}
        <nav className="flex-1 flex justify-center gap-10 text-gray-800 font-bold text-lg">
          <button
            onClick={() => router.push("/kategori")}
            className="transition-colors"
            style={{ color: "inherit" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#810000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Kategori
          </button>
          <button
            onClick={() => router.push("/laporan")}
            className="transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#810000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Laporan
          </button>
          <button
            onClick={() => router.push("/stok")}
            className="transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#810000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Stok
          </button>
          <button
            onClick={() => router.push("/produk")}
            className="transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#810000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Produk
          </button>
        </nav>

        <div>
          <button
            onClick={handleLogout}
            className="text-white font-semibold rounded-lg hover:bg-red-600 transition text-lg px-4 py-3 h-10 min-w-[100px]"
            style={{ backgroundColor: "#810000" }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
