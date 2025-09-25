import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

let transportConfig = undefined;
if (isDev) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("pino-pretty");
    transportConfig = {
      target: "pino-pretty",
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: "SYS:standard",
      },
    };
  } catch {
    console.warn(
      "pino-pretty not available in this environment; using plain Pino output",
    );
  }
}

const logger = pino({
  level: isDev ? "debug" : "info",
  ...(transportConfig && { transport: transportConfig }),
});

export default logger;
