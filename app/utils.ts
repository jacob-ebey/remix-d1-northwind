import { defer, type Session } from "@remix-run/cloudflare";

export async function maybeDefer<T extends Record<string, unknown>>(
  session: Session,
  data: T
) {
  const delay = Number(session.get("delay") || 0);
  const shouldDefer = Boolean(session.get("defer"));

  if (!shouldDefer) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Promise) {
      if (shouldDefer) {
        (data as any)[key] = new Promise((resolve) =>
          setTimeout(resolve, delay)
        ).then(() => value);
      } else {
        (data as any)[key] = await value;
      }
    }
  }

  return defer(data);
}
