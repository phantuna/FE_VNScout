import { Loader2, Search, Info, RotateCcw, EyeOff, Image as ImageIcon, Calendar, CheckCircle, Ban, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { parseUTCDate } from "@/utils/date"
import { EmptyState } from "../widgets/admin-empty-state"
import type { ReportResponse } from "@/types"

interface AdminTabPostsProps {
  tabLoading: boolean
  filteredPosts: any[]
  postQuery: string
  setPostQuery: (q: string) => void
  postsPage: number
  setPostsPage: (page: number | ((p: number) => number)) => void
  postsTotalPages: number
  viewPostReports: (id: string) => void
  togglePostDeletion: (id: string, deleted: boolean) => void
  reports: ReportResponse[]
  pendingReportsCount: number
  fetchAdminData: () => Promise<void>
  handleDismiss: (id: string) => Promise<void>
  handleResolve: (id: string) => Promise<void>
  handleBanUser: (userId: string | undefined, reportId?: string) => void
}

export function AdminTabPosts({
  tabLoading,
  filteredPosts,
  postQuery,
  setPostQuery,
  postsPage,
  setPostsPage,
  postsTotalPages,
  viewPostReports,
  togglePostDeletion,
  reports,
  pendingReportsCount,
  fetchAdminData,
  handleDismiss,
  handleResolve,
  handleBanUser
}: AdminTabPostsProps) {
  return (
    <div className="animate-in fade-in-50 duration-200">
      {tabLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="space-y-8">

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Sleek Integrated Table Header */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">Danh sách Bài viết ({filteredPosts.length})</h2>
              <p className="text-slate-400 text-[11px] font-bold mt-0.5">Quản lý toàn bộ nội dung được cộng đồng đăng tải. Cấp quyền ẩn hoặc khôi phục hiển thị.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm bài viết, tác giả..."
                value={postQuery}
                onChange={(e) => setPostQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                  <th className="p-4">Ảnh & Caption</th>
                  <th className="p-4">Tác giả</th>
                  <th className="p-4">Địa điểm</th>
                  <th className="p-4">Đánh giá</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-bold">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon="🖼️" title="Không có bài viết nào" description="Không tìm thấy bài viết phù hợp. Thử từ khóa khác." compact />
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                          {post.photos && post.photos.length > 0 ? (
                            <img src={post.photos[0].imageUrl} alt="post" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300"><ImageIcon className="h-4 w-4" /></div>
                          )}
                        </div>
                        <div className="max-w-[240px] truncate">
                          <p className="text-slate-800 font-extrabold truncate">{post.caption || "(Không có caption)"}</p>
                          <span className="text-[10px] text-slate-400 font-bold">{parseUTCDate(post.createdDate || post.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{post.user ? post.user.username : "Ẩn danh"}</td>
                      <td className="p-4 text-slate-600">{post.location ? post.location.name : "Không có"}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-bold text-amber-600 bg-amber-50 border-amber-100">
                          ★ {post.averageRating ? post.averageRating.toFixed(1) : "0.0"} ({post.totalRatings || 0})
                        </Badge>
                      </td>
                      <td className="p-4">
                        {post.deleted ? (
                          <Badge className="bg-rose-500 text-white font-bold text-[9px] uppercase tracking-wide">Bị ẩn / Ban</Badge>
                        ) : (
                          <Badge className="bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wide">Hoạt động</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center bg-white border border-slate-200 rounded-full p-0.5 shadow-sm hover:shadow-md transition-shadow">
                          <button
                            className={`p-2 rounded-full transition-all relative ${
                              reports.some(r => r.postId === post.id) 
                                ? "text-red-500 hover:bg-red-50 hover:text-red-700 animate-pulse" 
                                : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                            title="Xem lịch sử tố cáo"
                            onClick={() => viewPostReports(post.id)}
                          >
                            {reports.some(r => r.postId === post.id) && (
                              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            )}
                            <Info className="h-4 w-4" />
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                          <button
                            className={`p-2 rounded-full transition-all ${post.deleted ? "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
                            title={post.deleted ? "Khôi phục bài viết" : "Ẩn bài viết"}
                            onClick={() => togglePostDeletion(post.id, post.deleted)}
                          >
                            {post.deleted ? <RotateCcw className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Integrated Table Footer Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPostsPage(p => Math.max(0, p - 1))}
              disabled={postsPage === 0}
              className="text-xs font-bold text-slate-600 bg-white"
            >
              Trang trước
            </Button>
            <span className="text-xs font-bold text-slate-500">
              Trang {postsPage + 1} / {postsTotalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPostsPage(p => Math.min(postsTotalPages - 1, p + 1))}
              disabled={postsPage >= postsTotalPages - 1}
              className="text-xs font-bold text-slate-600 bg-white"
            >
              Trang sau
            </Button>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}
