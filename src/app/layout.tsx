import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"

import Script from "next/script"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"

const _inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" })
const _playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "VPS - Vietnam Photo Scout",
  description:
    "Discover and share the most beautiful photo spots across Vietnam. A social network for photographers.",
}

export const viewport: Viewport = {
  themeColor: "#d97706",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body
        className={`${_inter.variable} ${_playfair.variable} font-sans antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        
        {/* VietMap Assets - Loaded globally for speed */}
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/@vietmap/vietmap-gl-js@6.0.1/dist/vietmap-gl.css" 
        />
        <Script 
          src="https://unpkg.com/@vietmap/vietmap-gl-js@6.0.1/dist/vietmap-gl.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
