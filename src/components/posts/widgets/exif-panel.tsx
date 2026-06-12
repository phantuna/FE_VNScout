"use client"

import React, { useState, useEffect } from "react"
import { Camera, Clock, Info, ShieldCheck, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { parseUTCDate } from "@/utils/date"

interface ExifData {
  cameraMake?: string
  cameraModel?: string
  lensModel?: string
  iso?: number
  aperture?: number
  shutterSpeed?: string
  focalLength?: number
  dateTaken?: string
  gpsLatitude?: number
  gpsLongitude?: number
  isLocationVerified?: boolean
  /** "SAFE" | "WARNING" | null — kết quả Gemini */
  moderationStatus?: "SAFE" | "WARNING" | null
  moderationMessage?: string
}

interface ExifPanelProps {
  exif?: ExifData
  className?: string
}

const getSections = (exif: ExifData) => [
  {
    title: "Thiết bị",
    items: [
      { label: "Hãng máy", value: exif.cameraMake },
      { label: "Model", value: exif.cameraModel },
      { label: "Ống kính", value: exif.lensModel },
    ].filter(item => item.value),
  },
  {
    title: "Cài đặt chụp",
    items: [
      { label: "ISO", value: exif.iso },
      { label: "Khẩu độ", value: exif.aperture ? `f/${exif.aperture}` : undefined },
      { label: "Tốc độ", value: exif.shutterSpeed },
      { label: "Tiêu cự", value: exif.focalLength ? `${exif.focalLength}mm` : undefined },
    ].filter(item => item.value),
  },
  {
    title: "Thời gian",
    items: [
      {
        label: "Ngày chụp",
        value: exif.dateTaken
      },
    ].filter(item => item.value),
  }
].filter(section => section.items.length > 0)

export function ExifPanel({ exif, className }: ExifPanelProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!exif) {
    return (
      <div className={cn("rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center", className)}>
        <Camera className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Vui lòng chọn ảnh để xem thông số kỹ thuật
        </p>
      </div>
    )
  }

  const sections = getSections(exif)

  const formatValue = (label: string, value: any) => {
    if (!value) return "-"
    if (label === "Ngày chụp" && mounted) {
      try {
        return parseUTCDate(value).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return value
      }
    }
    if (label === "Ngày chụp" && !mounted) return "" 
    if (label === "Khẩu độ") return `f/${value}`
    if (label === "Tiêu cự") return `${value}mm`
    return value
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {section.title}
            </h4>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="group flex flex-col border-b border-slate-200/50 pb-2 last:border-b-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
                  <span className="mt-1 text-sm font-bold text-slate-700 group-hover:text-primary transition-colors truncate">
                    {formatValue(item.label, item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tọa độ GPS</span>
              <p className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                {typeof exif.gpsLatitude === 'number' && typeof exif.gpsLongitude === 'number'
                  ? `${exif.gpsLatitude.toFixed(6)}, ${exif.gpsLongitude.toFixed(6)}`
                  : "Chưa cập nhật"
                }
              </p>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vị trí</span>
              <div className="flex items-center gap-2">
                <Badge variant={exif.isLocationVerified ? "default" : "secondary"} className={cn(
                  "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full",
                  exif.isLocationVerified ? "bg-emerald-500 hover:bg-emerald-600" : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none shadow-none"
                )}>
                  {exif.isLocationVerified ? "Đã xác thực" : "Chờ xác thực"}
                </Badge>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kiểm duyệt AI</span>
              <div className="flex items-center gap-2">
                {exif.moderationStatus === "SAFE" && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-700 border-none shadow-none">
                    <ShieldCheck className="h-3 w-3" />
                    An toàn
                  </Badge>
                )}
                {exif.moderationStatus === "WARNING" && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-amber-50 text-amber-700 border-none shadow-none">
                    <AlertTriangle className="h-3 w-3" />
                    Cảnh báo
                  </Badge>
                )}
                {!exif.moderationStatus && (
                  <Badge variant="secondary" className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">
                    Chờ xử lý
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {exif.moderationStatus === "WARNING" && exif.moderationMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              {exif.moderationMessage}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Scouter Technical Analysis • Verified Metadata
        </p>
      </div>
    </div>
  )
}
