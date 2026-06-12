import { PostDetailView } from "@/components/posts/post-detail"
import { notFound } from "next/navigation"

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PostDetailView postId={id} />
}
