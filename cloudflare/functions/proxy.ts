import { Env } from '../src/config'

export const onRequest: PagesFunction<Env> = async (context) => {
  if (!context.env.PROXY_ENABLE) {
    return new Response(
      JSON.stringify({
        reason: 'proxy disabled'
      }),
      { status: 403 }
    )
  }

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
