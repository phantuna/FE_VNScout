"use client"

import { useState } from "react"
import { MapPin, Flame, Bell, RefreshCw, Database, Zap, X, ChevronRight } from "lucide-react"

interface QuickAction {
  id: string
  icon: React.ElementType
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
}

interface QuickActionsProps {
  onApproveLocations: () => void
  onViewHotReports: () => void
  onReloadData: () => void
}

const QUICK_ACTIONS = (handlers: QuickActionsProps): QuickAction[] => [
  {
    id: "approve-locations",
    icon: MapPin,
    label: "Duyệt địa điểm mới",
    description: "Chuyển đến tab Địa điểm",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    id: "hot-reports",
    icon: Flame,
    label: "Xem report nóng",
    description: "Xử lý vi phạm ưu tiên",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  {
    id: "notification",
    icon: Bell,
    label: "Gửi thông báo hệ thống",
    description: "Thông báo tới toàn bộ user",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: "reload-ai",
    icon: RefreshCw,
    label: "Reload AI Moderation",
    description: "Tải lại hàng chờ AI",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    id: "backup-cache",
    icon: Database,
    label: "Refresh Cache",
    description: "Tải lại toàn bộ dữ liệu",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
]

interface NotifyModalProps {
  onClose: () => void
  onSend: (message: string) => void
}

function NotifyModal({ onClose, onSend }: NotifyModalProps) {
  const [message, setMessage] = useState("")
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-500" />
            Gửi thông báo hệ thống
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Nhập nội dung thông báo tới tất cả người dùng..."
            rows={4}
            className="w-full text-xs font-bold text-slate-700 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none placeholder:font-medium placeholder:text-slate-400"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
              Hủy
            </button>
            <button
              onClick={() => { if (message.trim()) { onSend(message); onClose() } }}
              disabled={!message.trim()}
              className="px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Gửi ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function QuickActions({ onApproveLocations, onViewHotReports, onReloadData }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)

  const actions = QUICK_ACTIONS({ onApproveLocations, onViewHotReports, onReloadData })

  const handleAction = (id: string) => {
    switch (id) {
      case "approve-locations": onApproveLocations(); setIsOpen(false); break
      case "hot-reports": onViewHotReports(); setIsOpen(false); break
      case "notification": setShowNotifyModal(true); setIsOpen(false); break
      case "reload-ai": onReloadData(); setIsOpen(false); break
      case "backup-cache": window.location.reload(); break
    }
  }

  return (
    <>
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        {isOpen && (
          <div className="mb-2 bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl shadow-slate-900/60 overflow-hidden w-60 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
            <div className="px-4 py-3 border-b border-slate-800">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</h4>
            </div>
            <div className="p-2 space-y-1">
              {actions.map(action => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border ${action.bgColor} ${action.borderColor} hover:opacity-80 transition-all text-left group`}
                  >
                    <div className={`p-1.5 rounded-lg bg-slate-800/60`}>
                      <Icon className={`h-3.5 w-3.5 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-black ${action.color}`}>{action.label}</p>
                      <p className="text-[9px] text-slate-600 truncate">{action.description}</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(v => !v)}
          className={`
            h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
            ${isOpen
              ? "bg-slate-700 shadow-slate-900/50 rotate-45"
              : "bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-110"
            }
          `}
        >
          <Zap className={`h-5 w-5 text-white transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
        </button>
      </div>

      {showNotifyModal && (
        <NotifyModal
          onClose={() => setShowNotifyModal(false)}
          onSend={msg => {
            console.log("Sending notification:", msg)
          }}
        />
      )}
    </>
  )
}
