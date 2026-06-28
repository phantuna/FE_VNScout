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
      <DesktopSidebar isCollapsed={true} />
      <MobileHeader />
      <main className="flex-1 transition-all duration-300 md:ml-[80px]">
        {children}
      </main>
    </div>
  )
}

