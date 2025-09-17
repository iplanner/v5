export default defineEventHandler(async (event) => {
  
  const config = useRuntimeConfig(event);
  const { session } = event.context;

  console.log('session',session);

  return {
    session
  }
})