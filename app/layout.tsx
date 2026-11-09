
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PinkBite",
  description: "PinkBite Food Ordering System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
