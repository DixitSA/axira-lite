import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "@/components/ui/toast";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Axira Lite | Operations Dashboard",
  description: "Operations dashboard for small contractor businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0">
              {children}
            </main>
          </div>
          <ToastContainer />
        </body>
      </html>
    </ClerkProvider>
  );
}
