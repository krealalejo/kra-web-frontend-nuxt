export default defineEventHandler((event) => {
  const cookie = getCookie(event, 'kra_session')
  return { authenticated: !!cookie }
})
