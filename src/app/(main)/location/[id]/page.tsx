import { LocationDetailView } from "@/components/location/location-detail-view"
import { use } from "react"

interface LocationDetailPageProps {
  params: Promise<{ id: string }>
}

export default function LocationDetailPage({ params }: LocationDetailPageProps) {
  const { id } = use(params)
  return <LocationDetailView id={id} />
}
