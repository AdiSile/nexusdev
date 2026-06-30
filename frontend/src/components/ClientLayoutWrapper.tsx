"use client";

import { useEffect, useState } from "react";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * ClientLayoutWrapper
 *
 * Învelește conținutul server-rendered al layout-ului și injectează
 * componente pur client-side (Navbar, CustomCursor, Footer) fără a forța
 * tot layout-ul să devină client component.
 */
export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      {mounted && <CustomCursor />}
    </>
  );
}