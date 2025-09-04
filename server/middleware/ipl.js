export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const { pathname } = getRequestURL(event);

  const allowedRoutes = [
    "/api/ipl"
  ];

  const baseUrl = config.public?.NUXT_APP_BASE_URL || "";

  if (!allowedRoutes.some((route) => pathname.startsWith(baseUrl + route))) {
    return;
  }

  const apiKey = getHeader(event, "x-api-key");

  if (apiKey !== config["X-API-KEY"]) {
    return sendError( event, createError({
        statusCode: 403,
        statusMessage: "Forbidden: Invalid API Key",
      })
    );
  }
});
