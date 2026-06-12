import { Ban } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminBanModalProps {
  confirmBanUser: { userId: string; reportId?: string } | null
  setConfirmBanUser: (val: { userId: string; reportId?: string } | null) => void
  confirmBanExecution: () => Promise<void>
}

export function AdminBanModal({
  confirmBanUser,
  setConfirmBanUser,
  confirmBanExecution
}: AdminBanModalProps) {
  if (!confirmBanUser) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-500 flex-shrink-0">
            <Ban className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-800">
              Xác nhận khóa tài khoản
            </h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn khóa tài khoản này không? Người dùng sẽ bị khóa và không thể tiếp tục đăng nhập vào hệ thống.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-bold"
            onClick={() => setConfirmBanUser(null)}
          >
            Hủy bỏ
          </Button>
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
            onClick={confirmBanExecution}
          >
            Khóa tài khoản
          </Button>
        </div>
      </div>
    </div>
  )
}
