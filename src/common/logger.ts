import winston, { Logger } from "winston";

/**
 * The Winston logger instance.
 * @type {Logger}
 */
export const logger: Logger = winston.createLogger({
  /**
   * The log level for the logger.
   * @type {string}
   * @default "info"
   */
  level: "info",

  /**
   * The log format for the logger.
   * @type {import("winston").Logform.Format}
   */
  format: winston.format.json(),

  /**
   * The transports used for logging.
   * @type {winston.transport[]}
   */
  transports: [new winston.transports.Console()],
});