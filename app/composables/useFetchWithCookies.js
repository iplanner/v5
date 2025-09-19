import { appendResponseHeader } from 'h3'

export const useFetchWithCookies = async (url, options = {}) => {

  const event = useRequestEvent();

  const requestCookies = useRequestHeader('cookie');
  options.headers = {
    ...options.headers,
    ...(requestCookies ? { cookie: requestCookies } : {})
  };

  const res = await $fetch.raw(url, options);

  const resposeCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : []

  for (const cookie of resposeCookies) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }
  return res._data;
}