export default defineEventHandler(async (event) => {
  return {
    message: "Hello from /api/index!",
    time: new Date().toISOString(),
  };
});