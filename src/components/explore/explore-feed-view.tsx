"use client"

import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ExploreTabPhotos } from "./tabs/explore-tab-photos"
import { ExploreTabPhotographers } from "./tabs/explore-tab-photographers"
import { ExploreTabTags } from "./tabs/explore-tab-tags"
import { useExploreFeed } from "@/hooks/use-explore-feed"

export function ExploreFeedView() {
  const {
    activeTab,
    setActiveTab,
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

  const TABS = [
    { id: "photos", label: "Photos" },
    { id: "photographers", label: "Photographers" },
    { id: "tags", label: "Tags" },
  ] as const

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center gap-4 px-6 py-4">
          <h1 className="text-xl font-bold text-foreground shrink-0">Explore</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search locations, photographers, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-muted border-0 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-t border-border px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="p-6 space-y-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* ── Photos Tab ── */}
            {activeTab === "photos" && (
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
              />
            )}

            {/* ── Photographers Tab ── */}
            {activeTab === "photographers" && (
              <ExploreTabPhotographers
                filteredUsers={filteredUsers}
                followingSet={followingSet}
                followLoading={followLoading}
                handleToggleFollow={handleToggleFollow}
              />
            )}

            {/* ── Tags Tab ── */}
            {activeTab === "tags" && (
              <ExploreTabTags
                sortedTrendingTags={sortedTrendingTags}
                tags={tags}
                posts={posts}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
