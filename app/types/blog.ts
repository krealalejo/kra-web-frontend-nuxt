export interface Reference {
  label: string
  url: string
}

export interface BlogPostDto {
  slug: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  references?: Reference[]
  imageUrl?: string | null
}
