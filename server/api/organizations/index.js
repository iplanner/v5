export default defineEventHandler(async (event) => {

  try{

    const session = await useAuthSession(event);
    console.log('session', session);

   return {
    message: "Hello from /api/organisations!",
    time: new Date().toISOString(),
   };

  }catch(error){
    
    console.error(error)
    const response = getLoginErrorHandler(error.message, error.cause);

    throw createError({
      statusCode: error.statusCode,
      message: response.title,
      data: response,
    });

  }

 
});