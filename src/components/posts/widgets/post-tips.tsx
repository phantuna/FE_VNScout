"use client"

import { Lightbulb, Camera } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExifPanel } from "./exif-panel"
import { type Post } from "@/types"

interface PostTipsExifProps {
  post: Post
}

export function PostTipsExif({ post }: PostTipsExifProps) {
  const [showExif, setShowExif] = useState(false)
  
  const displayTip = post.shootingTip || ""
  const isService = post.location?.locationType === "SERVICE"
  const activePhoto = post.photos?.[0]

  return (
    <>
      {/* Photo Tip */}
      {displayTip && (
        <section className="rounded-[2.5rem] border border-primary/10 bg-primary/5 p-6 sm:p-8 shadow-inner overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Lightbulb className="h-20 w-20 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-primary/20 p-3 text-primary shadow-sm">
                <Lightbulb className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                {isService ? "Đánh giá trải nghiệm" : "Mẹo từ Scouter"}
              </p>
            </div>
            <p className="text-lg font-bold leading-relaxed text-slate-800 italic">"{displayTip}"</p>
          </div>
        </section>
      )}

      {/* EXIF */}
      {!isService && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />Thông số kỹ thuật
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowExif(!showExif)} 
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
            >
              {showExif ? "Ẩn bớt" : "Xem chi tiết"}
            </Button>
          </div>
          {showExif && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <ExifPanel exif={activePhoto} />
            </div>
          )}
        </section>
      )}
    </>
  )
}
