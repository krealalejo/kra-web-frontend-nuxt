/** Mirrors Spring `PortfolioRepoResponse` / `PortfolioRepoDetailResponse` JSON (camelCase). */
export interface PortfolioRepoDto {
  owner: string
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  topics: string[]
  stargazersCount: number
  updatedAt: string
  defaultBranch?: string | null
  readmeExcerpt?: string | null
}
