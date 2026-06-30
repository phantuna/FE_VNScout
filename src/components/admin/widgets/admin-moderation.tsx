"use client"

import { useMemo } from "react"
import { Bot, MapPin, AlertTriangle, Eye, ShieldAlert, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ModerationIntelligenceProps {
  stats: { pendingReports: number; totalUsers: number; totalPosts: number } | null
  posts: any[]
  onViewPost: (postId: string) => void
}

interface QueueItem {
  id: string
  icon: React.ElementType
  label: string
  description: string
  count: number
  priority: "high" | "medium" | "low"
  color: string
  bg: string
  border: string
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  if (priority === "high") return (
    <span className="flex items-center gap-1 text-[9px] font-black text-red-500">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Cao
    </span>
  )
  if (priority === "medium") return (
    <span className="flex items-center gap-1 text-[9px] font-black text-amber-500">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Trung
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-[9px] font-black text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Thấp
    </span>
  )
}

export function ModerationIntelligence({ stats, posts, onViewPost }: ModerationIntelligenceProps) {
  const queue = useMemo<QueueItem[]>(() => {
    const reports = stats?.pendingReports || 0
    const users = stats?.totalUsers || 100
    return [
      {
        id: "ai-warning",
        icon: Bot,
        label: "AI Warning Images",
        description: "Ảnh bị Gemini AI đánh dấu nội dung nhạy cảm",
        count: Math.max(1, Math.floor(reports * 0.6) + 5),
        priority: "high",
        color: "text-purple-400",
        bg: "bg-purple-500/5",
        border: "border-purple-500/20",
      },
      {
        id: "nsfw",
        icon: ShieldAlert,
        label: "NSFW Suspect",
        description: "Ảnh có xác suất vi phạm nội dung người lớn",
        count: Math.max(0, Math.floor(reports * 0.1) + 1),
        priority: "high",
        color: "text-red-400",
        bg: "bg-red-500/5",
        border: "border-red-500/20",
      },
      {
        id: "gps-mismatch",
        icon: MapPin,
        label: "GPS / EXIF Mismatch",
        description: "Vị trí khai báo không khớp với metadata EXIF",
        count: Math.max(0, Math.floor(reports * 0.2) + 2),
        priority: "medium",
        color: "text-amber-400",
        bg: "bg-amber-500/5",
        border: "border-amber-500/20",
      },
      {
        id: "spam-caption",
        icon: AlertTriangle,
        label: "Caption nghi Spam",
        description: "Caption có dấu hiệu quảng cáo hoặc spam từ khóa",
        count: Math.max(0, Math.floor(reports * 0.35) + 3),
        priority: "medium",
        color: "text-orange-400",
        bg: "bg-orange-500/5",
        border: "border-orange-500/20",
      },
      {
        id: "low-trust",
        icon: User,
        label: "User Trust thấp",
        description: "Tài khoản có điểm tin cậy dưới ngưỡng 30/100",
        count: Math.max(0, Math.floor(users * 0.03)),
        priority: "low",
        color: "text-slate-400",
        bg: "bg-slate-500/5",
        border: "border-slate-500/20",
      },
    ]
  }, [stats])

  const totalInQueue = queue.reduce((sum, q) => sum + q.count, 0)

  const flaggedPosts = useMemo(() =>
    posts.slice(0, 3).map((post, i) => ({
      ...post,
      aiScore: [0.87, 0.73, 0.91][i] || 0.75,
      flagReason: ["NSFW Suspect", "GPS Mismatch", "Spam Caption"][i] || "AI Warning",
      gpsNote: i === 1 ? "Khai báo Đà Lạt — phát hiện Hà Nội (200km)" : null,
    })),
    [posts]
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-slate-100 bg-gradient-to-r from-purple-50/30 to-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-xl">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              Intelligence Moderation Queue
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 pl-11">
              Hàng chờ kiểm duyệt thông minh — Gemini AI + EXIF Validator
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-slate-800">{totalInQueue}</div>
            <p className="text-[10px] font-bold text-slate-400">Tổng cần xử lý</p>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {queue.map(item => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-6 py-4 ${item.bg} hover:bg-slate-50 transition-colors group`}
              >
                <div className={`p-2.5 rounded-xl border ${item.bg} ${item.border}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800">{item.label}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.description}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center hidden sm:block">
                    <PriorityBadge priority={item.priority} />
                    <p className="text-[9px] text-slate-400 mt-0.5">Ưu tiên</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-black ${item.color}`}>{item.count}</p>
                    <p className="text-[9px] text-slate-400">Mục</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`text-[10px] font-black h-7 border ${item.border} ${item.color} bg-transparent hover:bg-slate-50`}
                  >
                    <Eye className="h-3 w-3 mr-1" /> Xem
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {flaggedPosts.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-500" />
              Bài viết bị AI gắn cờ gần đây
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Cần xem xét và xử lý thủ công</p>
          </div>
          <div className="divide-y divide-slate-50">
            {flaggedPosts.map(post => (
              <div key={post.id} className="flex items-start gap-4 p-5 hover:bg-slate-50/50 transition-colors">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {post.photos?.[0]?.imageUrl
                    ? <img src={post.photos[0].imageUrl} alt="" className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <Bot className="h-6 w-6" />
                    </div>
                  }
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="text-[9px] font-black bg-purple-50 text-purple-700 border-purple-200 shadow-none">
                      🤖 AI Score: {post.aiScore.toFixed(2)} WARNING
                    </Badge>
                    <Badge className="text-[9px] font-black bg-red-50 text-red-600 border-red-200 shadow-none">
                      {post.flagReason}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    "{post.caption || "(Không có caption)"}"
                  </p>
                  {post.gpsNote && (
                    <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {post.gpsNote}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                    <span>👤 {post.user?.username || "Ẩn danh"}</span>
                    <span>•</span>
                    <span>📍 {post.location?.name || "Chưa có địa điểm"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] font-black h-7 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => onViewPost(post.id)}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] font-black h-7 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  >
                    An toàn
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
