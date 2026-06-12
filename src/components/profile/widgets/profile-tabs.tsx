"use client"

import Link from "next/link"
import Image from "next/image"
import { Grid3X3, Bookmark, Heart, Camera, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Post } from "@/types"

interface ProfileTabsProps {
  userPosts: Post[]
  savedPosts: Post[]
  isLoadingSaved: boolean
}

export function ProfileTabs({
  userPosts,
  savedPosts,
  isLoadingSaved,
}: ProfileTabsProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="posts"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent py-3 text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="text-xs font-medium">Posts</span>
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent py-3 text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <Bookmark className="h-4 w-4" />
            <span className="text-xs font-medium">Saved</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {userPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 p-1 lg:grid-cols-4">
              {userPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="group relative aspect-square overflow-hidden rounded-md"
                >
                  <Image
                    src={post.photos?.[0]?.imageUrl || "/placeholder.svg"}
                    alt="User post"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/30 group-hover:opacity-100">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-card">
                      <Heart className="h-4 w-4 fill-current" />
                      {post.likeCount || 0}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Camera className="h-12 w-12" strokeWidth={1} />
              <p className="mt-3 text-sm">Chưa có bài đăng nào</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          {isLoadingSaved ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : savedPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 p-1 lg:grid-cols-4">
              {savedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="group relative aspect-square overflow-hidden rounded-md"
                >
                  <Image
                    src={post.photos?.[0]?.imageUrl || "/placeholder.svg"}
                    alt="Saved post"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 1024px) 33vw, 25vw"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bookmark className="h-12 w-12" strokeWidth={1} />
              <p className="mt-3 text-sm">Chưa lưu bài nào</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
