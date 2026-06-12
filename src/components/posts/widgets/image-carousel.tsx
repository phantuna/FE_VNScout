"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function ImageCarousel({
  images,
  postId,
}: {
  images: string[]
  postId: string
}) {
  const [current, setCurrent] = useState(0)

  const next = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrent((c) => (c + 1) % images.length)
  }, [images.length])

  const prev = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrent((c) => (c - 1 + images.length) % images.length)
  }, [images.length])

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
      <Link href={`/post/${postId}`} className="block h-full w-full">
        <Image
          src={images[current] || "/placeholder.svg"}
          alt={`Post ${postId} photo ${current + 1}`}
          fill
          className="object-cover transition-opacity hover:opacity-90"
          sizes="(max-width: 768px) 100vw, 640px"
          priority={current === 0}
          loading="eager"
        />
      </Link>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-foreground/20 p-2 text-card backdrop-blur-sm transition-colors hover:bg-foreground/40"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-foreground/20 p-2 text-card backdrop-blur-sm transition-colors hover:bg-foreground/40"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={`dot-${postId}-${i}`}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  i === current ? "w-4 bg-card" : "bg-card/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
