export default defineEventHandler(async (event) => {
  const routerParams = getRouterParams(event)
  const parts = routerParams.params.split("/");

  return {
    parts
  }
})