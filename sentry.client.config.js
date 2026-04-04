import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://08c9791917054fde8a5f69a50fda47da@o4511160621596672.ingest.us.sentry.io/4511160647483392",
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});
