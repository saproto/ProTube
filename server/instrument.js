const Sentry = require("@sentry/node");
// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: false,
});
