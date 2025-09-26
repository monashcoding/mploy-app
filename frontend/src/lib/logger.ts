import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
  level: isDev ? "debug" : "info",
});

export default logger;
