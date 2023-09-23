export const onRequest: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      message: 'pong'
    })
  )
}
