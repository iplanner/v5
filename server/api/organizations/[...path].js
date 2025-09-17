export default defineEventHandler(async (event) => {
  const routerParams = getRouterParams(event)
  const path = routerParams.path.split("/");

  return {
    path
  }
})