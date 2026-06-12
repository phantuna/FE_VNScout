import Link from "next/link"
import Image from "next/image"
import { TrendingUp } from "lucide-react"
import { type Post } from "@/types"

interface TagItem {
  id: string
  name: string
  postCount?: number
}

interface ExploreTabTagsProps {
  sortedTrendingTags: TagItem[]
  tags: TagItem[]
  posts: Post[]
}

export function ExploreTabTags({
  sortedTrendingTags,
  tags,
  posts,
}: ExploreTabTagsProps) {
  return (
    <div>
      <h2 className="mb-6 text-lg font-bold text-foreground">Trending Tags</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTrendingTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/explore?tag=${tag.name}`}
            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary hover:bg-card/80"
          >
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-foreground">#{tag.name}</h4>
              <p className="text-sm text-muted-foreground">
                {tag.postCount ? `${tag.postCount} posts` : "Xem bài viết"}
              </p>
              {/* Preview photos from posts with this tag */}
              <div className="flex gap-2 mt-3">
                {posts
                  .filter((p) => p.tags?.includes(tag.name))
                  .slice(0, 3)
                  .flatMap((p) => p.photos?.slice(0, 1) || [])
                  .slice(0, 3)
                  .map((photo, i) => (
                    <div key={i} className="relative h-12 w-12 overflow-hidden rounded-lg">
                      <Image src={photo.imageUrl} alt="Tag preview" fill className="object-cover" sizes="48px" />
                    </div>
                  ))}
              </div>
            </div>
          </Link>
        ))}
        {tags.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-20 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mb-3" strokeWidth={1} />
            <p className="text-sm">Chưa có hashtag nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
