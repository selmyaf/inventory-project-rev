"use client";
import { useEffect } from "react";  // <--- impor useEffect
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // redirect ke login
  }, [router]);

  return null; // bisa kasih loading spinner kalau mau
}
