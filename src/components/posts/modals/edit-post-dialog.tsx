"use client"

import { Lightbulb, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface EditPostDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isEditing: boolean
  caption: string
  setCaption: (val: string) => void
  tip: string
  setTip: (val: string) => void
}

export function EditPostDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isEditing,
  caption,
  setCaption,
  tip,
  setTip,
}: EditPostDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Chỉnh sửa bài viết</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="caption" className="text-sm font-semibold">Nội dung</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px] resize-none"
              placeholder="Nhập nội dung bài viết..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tip" className="text-sm font-semibold flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-primary" />
              Mẹo chụp / Đánh giá
            </Label>
            <Textarea
              id="tip"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="resize-none"
              placeholder="Chia sẻ mẹo chụp ảnh hoặc đánh giá trải nghiệm..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isEditing}>Huỷ</Button>
          <Button onClick={onConfirm} disabled={isEditing || !caption.trim()}>
            {isEditing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
