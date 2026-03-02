import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Player Cards — Get to Know Your Teammates",
  description: "Create and share baseball player profile cards with your team",
  openGraph: {
    title: "Player Cards ⚾",
    description: "Create and share baseball player profile cards with your team",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
