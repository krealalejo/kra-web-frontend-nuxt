/** Shape of `BlogPostResponse` from the KRA API (JSON dates as strings). */
export interface BlogPostDto {
  slug: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}
