import { MapView } from "@/components/map"
import { Suspense } from "react"

export default function MapPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Đang tải bản đồ...</div>}>
      <MapView />
    </Suspense>
  )
}
