export const onRequest: PagesFunction = async (context) => {
  const url = context.request.url
  const { searchParams } = new URL(url)
  const target = searchParams.get('l')
  if (!target) {
    return new Response(
      JSON.stringify({
        reason: 'missing target URL'
      }),
      { status: 400 }
    )
  }

  const res = await fetch(target)
  return res
}
