"use client"

import { useEffect, useState, useCallback } from "react"
import {
  AlertTriangle, CheckCircle, Trophy, EyeOff, UserPlus, MapPin,
  ShieldAlert, Bot, Zap
} from "lucide-react"

type EventSeverity = "info" | "warning" | "success" | "danger"
type EventType =
  | "report"
  | "verified"
  | "ai_warning"
  | "level_up"
  | "post_hidden"
  | "user_joined"
  | "location_approved"
  | "ban"
  | "exif_mismatch"

interface ActivityEvent {
  id: string
  type: EventType
  message: string
  severity: EventSeverity
  timestamp: Date
}

const EVENT_TEMPLATES: Omit<ActivityEvent, "id" | "timestamp">[] = [
  { type: "report", message: "luna06 vừa bị report bởi 3 người dùng", severity: "danger" },
  { type: "ai_warning", message: "Ảnh #4521 bị AI đánh dấu WARNING: Nghi NSFW", severity: "warning" },
  { type: "verified", message: "Địa điểm Hồ Hoàn Kiếm được xác thực thành công", severity: "success" },
  { type: "level_up", message: "nguyenvana đạt Level 5 — Spot Hunter 🏆", severity: "info" },
  { type: "post_hidden", message: "Bài viết #892 bị ẩn bởi admin Tuna-admin", severity: "warning" },
  { type: "user_joined", message: "User mới tranthibich vừa đăng ký tài khoản", severity: "info" },
  { type: "location_approved", message: "Làng Trà Quế, Hội An được phê duyệt", severity: "success" },
  { type: "ban", message: "Tài khoản spammer_123 bị khóa vĩnh viễn", severity: "danger" },
  { type: "exif_mismatch", message: "GPS mismatch: Ảnh khai báo Đà Lạt — phát hiện Hà Nội (200km)", severity: "warning" },
  { type: "report", message: "photohunter99 bị report bởi 2 người dùng", severity: "danger" },
  { type: "ai_warning", message: "Ảnh #7783 bị AI cảnh báo: Caption nghi Spam", severity: "warning" },
  { type: "level_up", message: "minhtam_photo đạt Level 3 — Scout", severity: "info" },
  { type: "verified", message: "Địa điểm Vịnh Hạ Long được cập nhật tọa độ", severity: "success" },
  { type: "user_joined", message: "User mới hoangduc22 vừa hoàn tất xác thực email", severity: "info" },
  { type: "post_hidden", message: "Bài viết #1204 vi phạm bản quyền — đã ẩn tự động", severity: "warning" },
  { type: "exif_mismatch", message: "EXIF thiếu dữ liệu GPS: Ảnh #3391 cần kiểm tra thủ công", severity: "warning" },
  { type: "ban", message: "Tài khoản fake_reviews_vn bị khóa sau 5 report", severity: "danger" },
  { type: "verified", message: "Phố cổ Hội An xác thực lần 2 — điểm uy tín tăng", severity: "success" },
]

const SEVERITY_CONFIG: Record<EventSeverity, { bg: string; border: string; dot: string; icon: React.ElementType; iconColor: string }> = {
  danger:  { bg: "bg-red-500/5",    border: "border-red-500/20",    dot: "bg-red-400",    icon: AlertTriangle, iconColor: "text-red-400" },
  warning: { bg: "bg-amber-500/5",  border: "border-amber-500/20",  dot: "bg-amber-400",  icon: AlertTriangle, iconColor: "text-amber-400" },
  success: { bg: "bg-emerald-500/5",border: "border-emerald-500/20",dot: "bg-emerald-400",icon: CheckCircle,   iconColor: "text-emerald-400" },
  info:    { bg: "bg-blue-500/5",   border: "border-blue-500/20",   dot: "bg-blue-400",   icon: Zap,           iconColor: "text-blue-400" },
}

const TYPE_ICONS: Record<EventType, React.ElementType> = {
  report:            ShieldAlert,
  verified:          CheckCircle,
  ai_warning:        Bot,
  level_up:          Trophy,
  post_hidden:       EyeOff,
  user_joined:       UserPlus,
  location_approved: MapPin,
  ban:               ShieldAlert,
  exif_mismatch:     AlertTriangle,
}

function formatRelativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff} giây trước`
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  return `${Math.floor(diff / 3600)} giờ trước`
}

function generateInitialEvents(): ActivityEvent[] {
  const shuffled = [...EVENT_TEMPLATES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 8).map((e, i) => ({
    ...e,
    id: `init-${i}`,
    timestamp: new Date(Date.now() - (i * 4 + Math.random() * 3) * 60 * 1000),
  }))
}

interface ActivityFeedProps {
  totalReports?: number
}

export function ActivityFeed({ totalReports = 0 }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(generateInitialEvents)
  const [newEventId, setNewEventId] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  // Simulate live events
  useEffect(() => {
    const delay = 8000 + Math.random() * 9000
    const timer = setTimeout(() => {
      const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)]
      const newEvent: ActivityEvent = {
        ...template,
        id: `live-${Date.now()}`,
        timestamp: new Date(),
      }
      setEvents(prev => [newEvent, ...prev].slice(0, 20))
      setNewEventId(newEvent.id)
      setTimeout(() => setNewEventId(null), 800)
    }, delay)
    return () => clearTimeout(timer)
  }, [events])

  // Relative time tick every 30s
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl shadow-slate-900/40 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <div className="p-1.5 bg-orange-500/20 rounded-lg">
              <Zap className="h-4 w-4 text-orange-400" />
            </div>
            Nhật ký hệ thống
          </h3>
          <p className="text-[10px] font-bold text-slate-500 mt-0.5 pl-9">Hoạt động gần đây</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-black text-emerald-400">LIVE</span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5 scrollbar-hide" style={{ maxHeight: 320 }}>
        {events.map((event, idx) => {
          const cfg = SEVERITY_CONFIG[event.severity]
          const Icon = TYPE_ICONS[event.type]
          const isNew = event.id === newEventId

          return (
            <div
              key={event.id}
              className={`
                flex items-start gap-3 p-3 rounded-xl border transition-all duration-500
                ${cfg.bg} ${cfg.border}
                ${isNew ? "scale-[1.02] shadow-lg shadow-orange-500/10" : "scale-100"}
              `}
              style={{
                animation: isNew ? "slideInFeed 0.4s ease-out" : undefined,
              }}
            >
              <div className={`p-1.5 rounded-lg bg-slate-800/60 shrink-0 mt-0.5`}>
                <Icon className={`h-3 w-3 ${cfg.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-200 leading-snug">{event.message}</p>
                <span className="text-[9px] font-bold text-slate-600 mt-0.5 block">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1.5 ${cfg.dot}`} />
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-slate-600">{events.length} sự kiện ghi nhận</span>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
          <span className="text-[9px] font-bold text-slate-600">{totalReports} report đang chờ</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFeed {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
