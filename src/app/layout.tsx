import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
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
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <ClerkProvider>
          <header className="fixed top-0 right-0 z-[60] p-4 flex items-center justify-end gap-3 pointer-events-none md:pointer-events-auto">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md bg-white border border-gray-200 shadow-sm pointer-events-auto">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md shadow-sm pointer-events-auto">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
          </header>

          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0">
              {children}
            </main>
          </div>
          <ToastContainer />
        </ClerkProvider>
      </body>
    </html>
  );
}
