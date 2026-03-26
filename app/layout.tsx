import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Agent",
  description: "AI-powered job tracking and application assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <nav className="border-b border-gray-800 px-6 py-3 flex gap-6 items-center">
          <Link href="/" className="font-semibold text-white hover:text-blue-400">
            Job Agent
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            Board
          </Link>
          <Link href="/chat" className="text-sm text-gray-400 hover:text-white">
            Chat
          </Link>
          <Link href="/profile" className="text-sm text-gray-400 hover:text-white">
            Profile
          </Link>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
