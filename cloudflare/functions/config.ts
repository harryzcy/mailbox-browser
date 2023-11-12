import { Env } from '../src/config'

export const onRequest: PagesFunction<Env> = async (context) => {
  return new Response(
    JSON.stringify({
      emailAddresses: context.env.EMAIL_ADDRESSES,
      disableProxy: !context.env.PROXY_ENABLE,
      imagesAutoLoad: context.env.IMAGES_AUTO_LOAD,
      plugins: [] // TODO: bring plugin support
    })
  )
}
