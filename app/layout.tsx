
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PinkBite",
  description: "PinkBite Food Ordering System",
  applicationName: "PinkBite",
  openGraph: {
    title: "PinkBite",
    description: "PinkBite Food Ordering System",
    siteName: "PinkBite",
    type: "website",
    url: "https://pink-bite.vercel.app/",
  },
  twitter: {
    card: "summary",
    title: "PinkBite",
    description: "PinkBite Food Ordering System",
  },
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
