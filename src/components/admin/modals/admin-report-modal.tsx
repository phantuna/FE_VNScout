import { Loader2, ShieldAlert, Calendar, CheckCircle, EyeOff, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { parseUTCDate } from "@/utils/date"

interface AdminReportModalProps {
  selectedPostId: string | null
  setSelectedPostId: (id: string | null) => void
  reportModalLoading: boolean
  selectedPostReports: any[] | null
  setSelectedPostReports: (reports: any[] | null) => void
  handleDismiss?: (id: string) => Promise<void>
  handleResolve?: (id: string) => Promise<void>
  handleBanUser?: (userId: string | undefined, reportId?: string) => void
}

export function AdminReportModal({
  selectedPostId,
  setSelectedPostId,
  reportModalLoading,
  selectedPostReports,
  setSelectedPostReports,
  handleDismiss,
  handleResolve,
  handleBanUser
}: AdminReportModalProps) {
  if (!selectedPostId) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              Lịch sử báo cáo bài viết
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Mã bài viết: {selectedPostId}</span>
          </div>
          <button onClick={() => { setSelectedPostId(null); setSelectedPostReports(null); }} className="text-slate-400 hover:text-slate-700 font-bold text-base">&times;</button>
        </div>

        <div className="p-6 max-h-[350px] overflow-y-auto space-y-6">
          {reportModalLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
          ) : selectedPostReports && selectedPostReports.length === 0 ? (
            <p className="text-center text-slate-400 text-xs font-bold py-6">Không tìm thấy lịch sử báo cáo nào dưới DB cho bài viết này.</p>
          ) : (
            <div className="relative border-l-2 border-slate-100 pl-6 ml-2 space-y-6">
              {selectedPostReports?.map((rep, idx) => (
                <div key={rep.id} className="relative">
                  {/* Node circle */}
                  <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 ring-4 ring-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span className="text-orange-500 font-black">{rep.reporterUsername || "Hệ thống tự động"}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {parseUTCDate(rep.createdAt || rep.createdDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                      {rep.reason}
                    </p>
                    
                    {/* Hành động xử lý cho báo cáo PENDING */}
                    {rep.status === 'PENDING' && handleDismiss && handleResolve && handleBanUser && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md" 
                          onClick={async () => {
                            await handleDismiss(rep.id);
                            setSelectedPostReports(prev => prev ? prev.map(r => r.status === 'PENDING' ? { ...r, status: 'DISMISSED' } : r) : null);
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Bỏ qua
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md" 
                          onClick={async () => {
                            await handleResolve(rep.id);
                            setSelectedPostReports(prev => prev ? prev.map(r => r.status === 'PENDING' ? { ...r, status: 'RESOLVED' } : r) : null);
                          }}
                        >
                          <EyeOff className="h-3 w-3 mr-1" /> Ẩn Bài
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md" 
                          onClick={() => {
                            handleBanUser(rep.postAuthorId, rep.id);
                            // Cập nhật state sau khi handleBanUser được confirm ở modal ngoài
                          }}
                        >
                          <Ban className="h-3 w-3 mr-1" /> Khóa User
                        </Button>
                      </div>
                    )}
                    
                    {/* Trạng thái đã xử lý */}
                    {rep.status !== 'PENDING' && (
                      <div className="pt-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${rep.status === 'RESOLVED' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'}`}>
                          {rep.status === 'RESOLVED' ? 'Đã Ẩn Bài & Cảnh Cáo' : 'Đã Bỏ Qua'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
          <Button size="sm" variant="outline" className="text-xs font-bold" onClick={() => { setSelectedPostId(null); setSelectedPostReports(null); }}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
