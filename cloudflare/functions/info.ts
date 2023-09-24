import { BUILD_VERSION, BUILD_COMMIT, BUILD_DATE } from '../src/buildInfo'

export const onRequest: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      version: BUILD_VERSION,
      commit: BUILD_COMMIT,
      build: BUILD_DATE
    })
  )
}
