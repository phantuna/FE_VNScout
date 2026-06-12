"use client"

import React from "react"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:block">
      {/* Navbar luôn thu gọn (80px) mặc định ở tất cả các trang, ẩn trên mobile */}
      <DesktopSidebar isCollapsed={true} />
      
      {/* Header cho Mobile (chỉ hiện trên màn hình nhỏ) */}
      <MobileHeader />
      
      {/* Phần nội dung chính luôn thụt vào 80px trên desktop, bung full trên mobile */}
      <main className="flex-1 transition-all duration-300 md:ml-[80px]">
        {children}
      </main>
    </div>
  )
}

