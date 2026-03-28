import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Briefcase, MessageSquare, User } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Agent",
  description: "AI-powered job tracking and application assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm px-6 py-3 flex items-center gap-1">
          <Link href="/" className="font-semibold text-foreground mr-4 flex items-center gap-2 whitespace-nowrap">
            <Briefcase className="h-4 w-4 text-blue-400" />
            Job Agent
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Board
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            Profile
          </Link>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
