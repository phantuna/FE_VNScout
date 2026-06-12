import Link from "next/link"
import { Users, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { type User } from "@/types"

interface ExploreTabPhotographersProps {
  filteredUsers: User[]
  followingSet: Set<string>
  followLoading: string | null
  handleToggleFollow: (targetUserId: string) => void
}

export function ExploreTabPhotographers({
  filteredUsers,
  followingSet,
  followLoading,
  handleToggleFollow,
}: ExploreTabPhotographersProps) {
  return (
    <div>
      <h2 className="mb-6 text-lg font-bold text-foreground">Photographers to Follow</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <Link href={`/profile/${user.id}`} className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-primary/10 ring-offset-2">
                  <AvatarImage src={user.avatarUrl || "/default-avatar.svg"} alt={user.username} />
                  <AvatarFallback className="text-xl font-bold">{user.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <Link
                href={`/profile/${user.id}`}
                className="mt-4 truncate text-sm font-bold text-foreground hover:underline"
              >
                {user.username}
              </Link>
              {(user.bio || (user as any).description) && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 px-2">
                  {user.bio || (user as any).description}
                </p>
              )}
              <div className="mt-2 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <div>
                  <span className="font-bold text-foreground">{(user.followersCount ?? 0).toLocaleString()}</span> followers
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div>
                  <span className="font-bold text-foreground">{(user.postsCount ?? 0).toLocaleString()}</span> posts
                </div>
              </div>
              <Button
                size="sm"
                variant={followingSet.has(user.id) ? "outline" : "default"}
                onClick={() => handleToggleFollow(user.id)}
                disabled={followLoading === user.id}
                className={`mt-4 w-full font-semibold ${
                  followingSet.has(user.id)
                    ? "border-primary text-primary"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {followLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : followingSet.has(user.id) ? "Following" : "Follow"}
              </Button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-20 text-muted-foreground">
            <Users className="h-12 w-12 mb-3" strokeWidth={1} />
            <p className="text-sm">Chưa có nhiếp ảnh gia nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
