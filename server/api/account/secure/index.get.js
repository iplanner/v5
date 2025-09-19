export default defineEventHandler(async (event) => {
  return {
    message: "Hello from /api/account/security",
    time: new Date().toISOString(),
  };
});