"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); 
  }, [router]);

  return null;
}
