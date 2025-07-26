import * as Sentry from "@sentry/nextjs";

export function safeParseJson(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    Sentry.captureException(e);
    throw e;
  }
} 