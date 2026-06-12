import { Users, Image as ImageIcon, AlertTriangle, Calendar, CheckCircle, EyeOff, Ban, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AdminStatsResponse, ReportResponse } from "@/types"
import { parseUTCDate } from "@/utils/date"
import { AdminCharts } from "../widgets/admin-charts"
import { EmptyState } from "../widgets/admin-empty-state"

interface AdminTabStatsProps {
  stats: AdminStatsResponse | null
}

export function AdminTabStats({
  stats
}: AdminTabStatsProps) {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* STATS METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="relative overflow-hidden p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
            <Users className="h-24 w-24" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">
              <Users className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100">+12% tháng này</Badge>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{stats?.totalUsers || 0}</h2>
            <p className="text-sm font-bold text-slate-500 mt-1">Tổng thành viên đăng ký</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110 group-hover:-rotate-12 duration-500">
            <ImageIcon className="h-24 w-24" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner">
              <ImageIcon className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100">+34 mới</Badge>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{stats?.totalPosts || 0}</h2>
            <p className="text-sm font-bold text-slate-500 mt-1">Bài viết được xuất bản</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-3xl shadow-xl shadow-red-500/30 group">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
            <AlertTriangle className="h-24 w-24" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 bg-white/20 text-white backdrop-blur-md rounded-2xl shadow-inner">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/20 hover:bg-white/30 backdrop-blur-md">Cần chú ý</Badge>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white tracking-tight">{stats?.pendingReports || 0}</h2>
            <p className="text-sm font-bold text-red-100 mt-1">Báo cáo vi phạm chờ xử lý</p>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <AdminCharts
        totalPosts={stats?.totalPosts || 0}
        totalUsers={stats?.totalUsers || 0}
        postsPerDay={stats?.postsPerDay}
        usersPerDay={stats?.usersPerDay}
      />

    </div>
  )
}
