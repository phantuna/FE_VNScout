"use client"

import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ExploreTabPhotos } from "./tabs/explore-tab-photos"
import { useExploreFeed } from "@/hooks/use-explore-feed"

export function ExploreFeedView() {
  const {
    searchQuery,
    setSearchQuery,
    posts,
    tags,
    loading,
    followingSet,
    followLoading,
    savedSet,
    validLocationIds,
    visibleExplorePostsCount,
    setVisibleExplorePostsCount,
    user,
    handleToggleFollow,
    handleToggleSave,
    sortedTrendingTags,
    filteredPosts,
    filteredUsers,
    fetchMorePosts,
    hasMore,
    loadingMore
  } = useExploreFeed()

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center gap-4 px-6 py-4">
          <h1 className="text-xl font-bold text-foreground shrink-0">Khám phá</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo thẻ hashtag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-muted border-0 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <ExploreTabPhotos
            posts={posts}
            validLocationIds={validLocationIds}
            sortedTrendingTags={sortedTrendingTags}
            filteredUsers={filteredUsers}
            followingSet={followingSet}
            followLoading={followLoading}
            handleToggleFollow={handleToggleFollow}
            filteredPosts={filteredPosts}
            visibleExplorePostsCount={visibleExplorePostsCount}
            setVisibleExplorePostsCount={setVisibleExplorePostsCount}
            fetchMorePosts={fetchMorePosts}
            hasMore={hasMore}
            loadingMore={loadingMore}
            user={user}
            handleToggleSave={handleToggleSave}
            savedSet={savedSet}
            setSearchQuery={setSearchQuery}
          />
        )}
      </div>
    </div>
  )
}
