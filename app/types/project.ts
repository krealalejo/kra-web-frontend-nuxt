/** Mirrors JSON from Spring `ProjectResponse` (GET /projects). */
export interface ProjectDto {
  id: string
  title: string
  description: string
  url: string
  content: string
}
