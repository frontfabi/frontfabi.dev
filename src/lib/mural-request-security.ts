export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}
