"use client"

import { useState, useRef, useMemo } from "react"
import {
  Camera,
  MapPin,
  Hash,
  Lightbulb,
  ImagePlus,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Upload,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/services/api.service"
import Image from "next/image"
import { ExifPanel } from "../widgets/exif-panel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface LocationPostFormProps {
  locationId: string
  locationName: string
  locationType?: string
  onClose: () => void
}

export function LocationPostForm({
  locationId,
  locationName,
  locationType,
  onClose,
}: LocationPostFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isServiceLocation = locationType === "SERVICE"

  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [photoTip, setPhotoTip] = useState("")

  const [images, setImages] = useState<any[]>([]) // Stores PhotoUploadResponse objects
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const PHOTO_LOCATION_MISMATCH_CODE = 3000
  const [formError, setFormError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmData, setConfirmData] = useState<{
    distanceKm?: string | null
    photoProvince?: string | null
    payload: any
  } | null>(null)

  const currentPhoto = images[selectedIndex]

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setFormError(null)
    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append("files", file)
    })

    try {
      const results = await apiFetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      })

      setImages((prev) => [...prev, ...results])

      // Check moderation warning status
      const warnedPhotos = results.filter((r: any) => r.moderationStatus === "WARNING")
      if (warnedPhotos.length > 0) {
        const firstWarning = warnedPhotos[0]
        setFormError(
          `⚠️ Phát hiện nội dung nhạy cảm trong bức ảnh: "${firstWarning.moderationMessage ?? "Có thể không phù hợp"}". Tuy nhiên bạn vẫn có quyền tiếp tục đăng bài.`
        )
      }

      if (images.length === 0 && results.length > 0) {
        setSelectedIndex(0)
      }
    } catch (error: any) {
      const apiMsg = error?.data?.message
      const displayMsg = apiMsg ?? "Ảnh không đúng định dạng hoặc vi phạm nguyên tắc cộng đồng."
      setFormError(`Không thể tải ảnh: ${displayMsg}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const files = { target: { files: e.dataTransfer.files } } as any
      handleFileChange(files)
    }
  }

  const handleCreatePost = async (forceCreate = false) => {
    setFormError(null)

    if (images.length === 0) {
      setFormError("Vui lòng chọn ít nhất một ảnh trước khi đăng.")
      return
    }

    setIsCreatingPost(true)

    const payload = {
      locationId: locationId,
      caption: content,
      shootingTip: photoTip,
      tags: tags,
      photoIds: images.map((img) => img.photoId),
      forceCreate,
    }

    try {
      const response = await apiFetch("/api/v1/posts/created", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      console.log("Post created successfully:", response)
      onClose()
      window.location.reload()
    } catch (error: any) {
      console.error("Failed to create post:", error)
      const errorData = error?.data || error

      if (errorData?.code === PHOTO_LOCATION_MISMATCH_CODE) {
        const distanceMeters = errorData?.result?.distanceMeters
        const distanceKm =
          typeof distanceMeters === "number"
            ? (distanceMeters / 1000).toFixed(2)
            : null

        setConfirmData({
          distanceKm,
          photoProvince: errorData?.result?.photoProvince,
          payload,
        })

        setShowConfirmDialog(true)
        return
      }

      if (errorData?.code === 9000 && Array.isArray(errorData.result)) {
        const messages = errorData.result.map((err: any) => err.message).join(". ")
        setFormError(messages)
        return
      }

      setFormError(errorData?.message || "Đã xảy ra sự cố khi đăng tải bài viết. Vui lòng kiểm tra và thử lại.")
    } finally {
      setIsCreatingPost(false)
    }
  }

  const handleConfirmPost = async () => {
    if (!confirmData) return

    setIsCreatingPost(true)
    try {
      const response = await apiFetch("/api/v1/posts/created", {
        method: "POST",
        body: JSON.stringify({
          ...confirmData.payload,
          forceCreate: true,
        }),
      })

      console.log("Post created after confirm distance:", response)
      onClose()
      window.location.reload()
    } catch (error) {
      console.error("Confirm post failed:", error)
      setFormError("Không thể hoàn tất đăng bài. Vui lòng thử lại.")
    } finally {
      setIsCreatingPost(false)
      setShowConfirmDialog(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index)
      if (selectedIndex >= newImages.length) {
        setSelectedIndex(Math.max(0, newImages.length - 1))
      }
      return newImages
    })
  }

  const addTag = (inputValue: string = tagInput) => {
    if (!inputValue.trim()) return

    const newTags = inputValue
      .split(/[ ,]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter((t) => t)

    if (newTags.length > 0) {
      setTags((prev) => {
        const combined = [...prev, ...newTags]
        const unique = Array.from(new Set(combined))
        return unique.slice(0, 5) // Limits to 5 tags maximum
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground">
              Đăng Bài Tại {locationName}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Chia sẻ góc nhìn nghệ thuật của bạn tại địa điểm tuyệt vời này
          </p>
        </div>
      </div>

      {/* Modern 2-Column Creative Studio Workspace (Always Rendered Parallel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />

        {/* Left Column: Media Stage & EXIF Dashboard (5/12 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {images.length === 0 ? (
            /* Uploader Zone (When no images yet) */
            <div
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 cursor-pointer transition-all duration-300 min-h-[300px] text-center shadow-sm relative overflow-hidden group",
                isDragging
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Camera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-foreground">Đang tải và đọc EXIF...</p>
                    <p className="text-[10px] text-muted-foreground">Có thể gõ caption và tag ở bên phải ngay lúc này!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-sm animate-in fade-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform duration-300">
                    <Upload className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black tracking-tight text-foreground">
                      Tải lên tác phẩm
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Kéo thả ảnh vào đây hoặc nhấp chọn. Hỗ trợ tối đa 10 ảnh.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground border border-border/40 shadow-inner">
                    <Camera className="h-3 w-3 text-primary" /> Đọc EXIF tự động
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Art Stage Preview (When images are uploaded) */
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Main Stage Preview */}
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border/40 bg-muted/40 shadow-md group">
                <Image
                  src={images[selectedIndex].imageUrl}
                  alt="Selected Artwork"
                  fill
                  className="object-cover"
                />

                {/* Navigation overlays */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-md"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedIndex((i) => (i + 1) % images.length)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-md"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Index counter pill */}
                <div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-0.5 text-[9px] font-black text-white tracking-widest backdrop-blur-sm">
                  {selectedIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnail Carousel Card */}
              <div className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm p-3.5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Phim âm bản ({images.length}/10)</span>
                  <span className="text-[8px] text-muted-foreground italic font-semibold">Nhấp để xem</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((photo, i) => (
                    <div
                      key={i}
                      className={cn(
                        "group relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200",
                        i === selectedIndex
                          ? "border-primary scale-[1.02] shadow-sm ring-2 ring-primary/10"
                          : "border-transparent opacity-65 hover:opacity-100"
                      )}
                      onClick={() => setSelectedIndex(i)}
                    >
                      <Image
                        src={photo.imageUrl}
                        alt={`Thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(i)
                        }}
                        className="absolute right-0.5 top-0.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-md hover:bg-red-600"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}

                  {images.length < 10 && (
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={isUploading}
                      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/40 transition-all hover:border-primary/50 hover:bg-muted"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* EXIF parameters board */}
              {!isServiceLocation && (
                <div className="border-t border-border/40 pt-2">
                  <ExifPanel
                    exif={currentPhoto ? {
                      ...currentPhoto.exifData,
                      isLocationVerified: currentPhoto.locationVerified,
                      moderationStatus: currentPhoto.moderationStatus,
                      moderationMessage: currentPhoto.moderationMessage,
                    } : undefined}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: High-end Form Inputs (7/12 cols) - ALWAYS ACTIVE & EDITABLE */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Content area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kể câu chuyện của bạn</label>
              <div className="rounded-2xl border border-border/60 bg-muted/15 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/60 transition-all duration-300 p-1">
                <Textarea
                  placeholder="Viết một chú thích đầy chất thơ, mô tả trải nghiệm, hoặc hoàn cảnh bạn săn được bức hình tuyệt vời này..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 p-3"
                />
              </div>
            </div>

            {/* Tags area */}
            {!isServiceLocation && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-primary" /> Khám phá & Tìm kiếm (Hashtags)
                </label>
              <div className="rounded-xl border border-border/60 bg-muted/15 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/60 transition-all duration-300 flex items-center px-3 py-1">
                <Input
                  placeholder={tags.length >= 5 ? "Đã đạt giới hạn 5 thẻ tag" : "Thêm thẻ tag... (cách nhau bởi phẩy hoặc dấu cách)"}
                  value={tagInput}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val.includes(" ") || val.includes(",")) {
                      addTag(val)
                    } else {
                      setTagInput(val)
                    }
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag(tagInput))
                  }
                  disabled={tags.length >= 5}
                  className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 h-9 disabled:cursor-not-allowed"
                />
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10 rounded-full px-2.5 py-0.5 shadow-sm transition-transform hover:scale-102"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive hover:scale-115 transition-all ml-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
                {tags.length >= 5 && (
                  <p className="text-[10px] text-red-500 font-bold tracking-wide animate-pulse">Bạn đã đạt số lượng giới hạn tối đa 5 thẻ tag.</p>
                )}
              </div>
            )}

            {/* Photo Tip area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-500" /> {isServiceLocation ? "Đánh giá dịch vụ" : "Mẹo thực tế cho Scouters khác"}
              </label>
              <div className="rounded-xl border border-border/60 bg-muted/15 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/60 transition-all duration-300 flex items-center px-3">
                <Lightbulb className="h-4 w-4 text-muted-foreground/60 mr-2 shrink-0 animate-pulse" />
                <Input
                  placeholder={isServiceLocation ? "Chia sẻ trải nghiệm của bạn tại đây..." : "Chia sẻ mẹo: giờ vàng chụp đẹp nhất, hướng đón sáng, vị trí đứng an toàn..."}
                  value={photoTip}
                  onChange={(e) => setPhotoTip(e.target.value)}
                  className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 h-10"
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 flex items-start gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span className="font-bold">{formError}</span>
              </div>
            )}
          </div>

          {/* Actions Panel */}
          <div className="flex gap-4 border-t border-border/40 pt-6 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreatingPost}
              className="flex-1 text-xs font-bold uppercase tracking-widest h-11 rounded-full hover:bg-muted/80 active:scale-98 transition-all duration-150"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => handleCreatePost(false)}
              disabled={!content.trim() || images.length === 0 || isCreatingPost || isUploading}
              className="flex-1 text-xs font-black uppercase tracking-widest h-11 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white shadow-md shadow-orange-500/10 active:scale-98 hover:scale-[1.01] hover:brightness-105 transition-all duration-150"
            >
              {isCreatingPost ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Đăng bài
            </Button>
          </div>
        </div>
      </div>

      {/* GPS coordinates mismatch warning popup Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </span>
              Xác Nhận Địa Điểm Chụp
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {confirmData?.photoProvince && (
                <span className="block mb-2 font-medium">
                  Ảnh được chụp thực tế tại: <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">{confirmData.photoProvince}</span>
                </span>
              )}
              {confirmData?.distanceKm
                ? `Hệ thống phân tích tọa độ của ảnh cách địa danh ${locationName} khoảng: `
                : "Tọa độ GPS trong ảnh nằm xa địa danh này."}
              {confirmData?.distanceKm && (
                <span className="font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md text-xs">{confirmData.distanceKm}km</span>
              )}
              <br />
              <span className="mt-4 block font-bold text-foreground">Bạn có chắc chắn muốn liên kết bức ảnh này vào địa danh {locationName} không?</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isCreatingPost}
              className="flex-1 rounded-full text-xs font-bold uppercase tracking-widest h-10"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmPost}
              disabled={isCreatingPost}
              className="flex-1 rounded-full text-xs font-black uppercase tracking-widest h-10 bg-red-500 hover:bg-red-600 text-white"
            >
              {isCreatingPost ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
              Tôi chắc chắn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
