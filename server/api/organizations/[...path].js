export default defineEventHandler(async (event) => {

  const routerParams = getRouterParams(event)
  const path = routerParams.path.split("/");

  try{

    const session = useAuthSession(event);
    console.log('session',session);

    return {
      message: "Hello from /api/organizations",
      time: new Date().toISOString(),
      path
    };

  }catch(error){
    console.error(error)
  }

});