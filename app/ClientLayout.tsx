"use client";

import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/context/AppProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProvider>
      <Toaster position="top-right" />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </AppProvider>
  );
} 