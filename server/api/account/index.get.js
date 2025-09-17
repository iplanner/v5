export default defineEventHandler(async (event) => {
  return {
    message: "Hello from /api/account!",
    time: new Date().toISOString(),
  };
});