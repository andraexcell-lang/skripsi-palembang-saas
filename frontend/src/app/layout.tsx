import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skripsi Palembang - AI Riset Assistant",
  description: "Asisten AI untuk penelitian skripsi, tesis, dan disertasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} antialiased`}>
        <Script id="sp-tema" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("sp-tema");if(t==="gelap"||(t!=="terang"&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`}
        </Script>
        {children}
      </body>
    </html>
  );
}
