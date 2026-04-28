export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'kra_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const owner = getRouterParam(event, 'owner')
  const repo = getRouterParam(event, 'repo')

  if (!owner) {
    throw createError({ statusCode: 400, statusMessage: 'Missing owner parameter' })
  }
  if (!repo) {
    throw createError({ statusCode: 400, statusMessage: 'Missing repo parameter' })
  }

  const body = await readBody(event)

  // Allowlist body fields — do not forward arbitrary keys
  const safeBody = {
    ...(body.role !== undefined && { role: body.role }),
    ...(body.year !== undefined && { year: body.year }),
    ...(body.kind !== undefined && { kind: body.kind }),
    ...(body.mainBranch !== undefined && { mainBranch: body.mainBranch }),
    ...(body.stack !== undefined && { stack: body.stack }),
  }

  const response = await $fetch(
    `${config.apiBase}/projects/metadata/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: safeBody,
    }
  )

  return response
})
