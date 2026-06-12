"use client"

import { useState, useEffect } from "react"
import { Camera, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { type Post } from "@/types"

interface PostImageGalleryProps {
  post: Post
}

export function PostImageGallery({ post }: PostImageGalleryProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const imageUrls = post.photos?.map(p => p.imageUrl) || []
  const displayCaption = post.caption || ""

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (previewIndex !== null) setPreviewIndex((previewIndex + 1) % imageUrls.length)
  }
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (previewIndex !== null) setPreviewIndex((previewIndex - 1 + imageUrls.length) % imageUrls.length)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (previewIndex === null) return
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "Escape") setPreviewIndex(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [previewIndex])

  return (
    <>
      <section>
        {/* Desktop Gallery */}
        <div className="hidden md:grid h-[420px] lg:h-[500px] gap-3 overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-inner">
          {imageUrls.length === 1 ? (
            <div className="relative h-full w-full overflow-hidden group cursor-pointer" onClick={() => setPreviewIndex(0)}>
              <img src={imageUrls[0]} alt={displayCaption} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-6 left-6 z-10">
                <Badge className="bg-white/95 text-slate-900 font-bold backdrop-blur-md border-none shadow-xl px-4 py-2">
                  <Camera className="mr-2 h-4 w-4 text-primary" />Xem ảnh gốc
                </Badge>
              </div>
            </div>
          ) : imageUrls.length === 2 ? (
            <div className="grid grid-cols-2 gap-3 w-full h-full">
              {imageUrls.slice(0, 2).map((url, idx) => (
                <div key={idx} className="relative h-full overflow-hidden group cursor-pointer" onClick={() => setPreviewIndex(idx)}>
                  <img src={url} alt={`Gallery ${idx}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 w-full h-full">
              <div className="relative col-span-2 h-full overflow-hidden group cursor-pointer" onClick={() => setPreviewIndex(0)}>
                <img src={imageUrls[0]} alt={displayCaption} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 z-10">
                  <Badge className="bg-white/90 text-slate-900 font-bold backdrop-blur-sm border-none shadow-sm">
                    <Camera className="mr-1.5 h-3.5 w-3.5 text-primary" />Ảnh chính
                  </Badge>
                </div>
              </div>
              <div className="grid grid-rows-2 gap-3 h-full">
                <div className="relative h-full overflow-hidden group cursor-pointer" onClick={() => setPreviewIndex(1)}>
                  <img src={imageUrls[1]} alt="Gallery 2" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="relative h-full overflow-hidden group cursor-pointer" onClick={() => setPreviewIndex(2)}>
                  <img src={imageUrls[2]} alt="Gallery 3" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {imageUrls.length > 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div className="text-center">
                        <span className="text-2xl font-black text-white">+{imageUrls.length - 3}</span>
                        <p className="text-[10px] text-white/80 font-bold uppercase">Ảnh khác</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Scroll */}
        <div className="flex md:hidden snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative flex-shrink-0 snap-center w-[85%] aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer" onClick={() => setPreviewIndex(i)}>
              <img src={url} alt={`Gallery ${i}`} className="h-full w-full object-cover" />
              <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                {i + 1} / {imageUrls.length}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={previewIndex !== null} onOpenChange={open => !open && setPreviewIndex(null)}>
        <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-none bg-white/70 backdrop-blur-2xl shadow-none flex items-center justify-center outline-none">
          <DialogTitle className="sr-only">Xem ảnh toàn màn hình</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center cursor-zoom-out" onClick={() => setPreviewIndex(null)}>
            <Button variant="ghost" size="icon" className="fixed top-6 right-6 z-50 bg-slate-900/10 text-slate-800 hover:bg-slate-900/20 rounded-full h-12 w-12 backdrop-blur-xl border border-slate-900/10" onClick={e => { e.stopPropagation(); setPreviewIndex(null) }}>
              <ChevronLeft className="h-8 w-8 rotate-180" />
            </Button>
            {imageUrls.length > 1 && (
              <Button variant="ghost" size="icon" className="fixed left-6 z-50 bg-slate-900/5 text-slate-800 hover:bg-slate-900/20 rounded-full h-14 w-14 backdrop-blur-lg border border-slate-900/5 transition-all hover:scale-110" onClick={handlePrev}>
                <ChevronLeft className="h-10 w-10" />
              </Button>
            )}
            {previewIndex !== null && (
              <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300">
                <img src={imageUrls[previewIndex]} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl pointer-events-none" />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-slate-600 font-bold text-sm">
                  Ảnh {previewIndex + 1} / {imageUrls.length}
                </div>
              </div>
            )}
            {imageUrls.length > 1 && (
              <Button variant="ghost" size="icon" className="fixed right-6 z-50 bg-slate-900/5 text-slate-800 hover:bg-slate-900/20 rounded-full h-14 w-14 backdrop-blur-lg border border-slate-900/5 transition-all hover:scale-110" onClick={handleNext}>
                <ChevronLeft className="h-10 w-10 rotate-180" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
