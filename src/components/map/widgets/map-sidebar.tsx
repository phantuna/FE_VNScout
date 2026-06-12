"use client"

import Image from "next/image"
import { Loader2, Camera, Navigation, MapPin, Badge as BadgeIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { type Location } from "@/types"

interface LocationWithStats extends Location {
  postCount?: number
  checkInCount?: number
  distance?: number
  coverPhoto?: string
}

interface MapLocationSidebarProps {
  locations: LocationWithStats[]
  loading: boolean
  userLocation: { lat: number; lng: number } | null
  selectedLocationId?: string
  onSelect: (loc: LocationWithStats) => void
}

export function MapLocationSidebar({ locations, loading, userLocation, selectedLocationId, onSelect }: MapLocationSidebarProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-muted/30 scrollbar-track-transparent">
      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground/90 px-1">
        <span>{userLocation ? "GÓC CHỤP GẦN BẠN NHẤT" : "DANH SÁCH ĐỊA ĐIỂM NỔI BẬT"}</span>
        <Badge variant="secondary" className="bg-muted text-[10px] text-muted-foreground font-extrabold border-none px-2 py-0.5">
          {locations.length} spots
        </Badge>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-[11px] text-muted-foreground mt-2 font-medium">Đang tìm nạp góc chụp & đồng bộ...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-border p-6 bg-muted/20">
          <MapPin className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-muted-foreground">Không tìm thấy địa điểm</h4>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Vui lòng điều chỉnh lại bộ lọc hoặc nhập từ khóa khác</p>
        </div>
      ) : (
        locations.map((loc) => {
          const isSelected = selectedLocationId === loc.id
          return (
            <div
              key={loc.id}
              onClick={() => onSelect(loc)}
              className={`group flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? "bg-primary/5 border-primary shadow-lg"
                  : "bg-card/45 border-border hover:bg-muted/30 hover:border-muted-foreground/20"
              }`}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={loc.coverPhoto || "/placeholder.svg"}
                  alt={loc.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="56px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className="bg-primary/10 text-primary border-none text-[9px] font-extrabold px-1.5 py-0 shrink-0">
                    {loc.category || "Địa danh"}
                  </Badge>
                  {loc.province && (
                    <span className="text-[10px] font-bold text-muted-foreground/80 shrink-0">{loc.province}</span>
                  )}
                </div>
                <h3 className="mt-1 text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {loc.name}
                </h3>
                <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                  {loc.address || loc.nameWithType}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1 shrink-0">
                    <Camera className="h-3 w-3 text-muted-foreground/80" /> {loc.postCount} ảnh đẹp
                  </span>
                  {loc.checkInCount !== undefined && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Navigation className="h-3 w-3 text-muted-foreground/80 rotate-45" /> {loc.checkInCount} checkin
                    </span>
                  )}
                  {loc.distance !== undefined && (
                    <span className="text-primary font-bold bg-primary/10 rounded px-1.5 py-0 text-[9px] shrink-0">
                      Cách bạn {loc.distance.toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
