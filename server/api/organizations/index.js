export default defineEventHandler(async (event) => {
  return {
    message: "Hello from /api/organisations!",
    time: new Date().toISOString(),
  };
});