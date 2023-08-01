import { PRODUCTION } from "./constants/environment";
import { ArgumentNullError } from "./errors/argument-null-error";
import { ServerError } from "./errors/server-error";

/**
 * Represents the configuration settings and environment variables used in a Node.js application.
 */
export class Environment {
  /**
   * Singleton instance of the Environment class.
   */
  private static instance: Environment;

  /**
   * Indicates whether the application is running in a production environment.
   */
  public readonly isProduction: boolean;

  /**
   * The port number on which the application should listen.
   * Defaults to 80 in production, or 8080 in non-production environments if not provided.
   */
  public readonly port: number = 80;

  /**
   * Username used to connect to the MongoDB database.
   */
  public readonly mongoUser: string;

  /**
   * Password used to connect to the MongoDB database.
   */
  public readonly mongoPassword: string;

  /**
   * Name of the MongoDB database to be used.
   */
  public readonly db: string;

  /**
   * Client ID for Google authentication.
   */
  public readonly googleClientId: string;

  /**
   * Client secret for Google authentication.
   */
  public readonly googleSecret: string;

  /**
   * An array of verified domains.
   */
  public readonly verifiedDomains: Array<string>;

  /**
   * An array of auth clients.
   */
  public readonly clients: Record<string, string> = {};

  /**
   * The audience claim for JWT.
   */
  public readonly audience: string;

  /**
   * The issuer claim for JWT.
   */
  public readonly issuer: string;

  /**
   * Private constructor to enforce the singleton pattern.
   * Initializes all the properties from the environment variables.
   */
  private constructor() {
    this.isProduction = process.env.NODE_ENV === PRODUCTION;
    this.port = this.isProduction ? 80 : parseInt(process.env.PORT || "8080");
    this.mongoUser = this.getOrThrow("MONGO_USER");
    this.mongoPassword = this.getOrThrow("MONGO_PASSWORD");
    this.db = this.getOrThrow("DB");
    this.googleClientId = this.getOrThrow("GOOGLE_CLIENT_ID");
    this.googleSecret = this.getOrThrow("GOOGLE_CLIENT_SECRET");
    this.verifiedDomains = this.getOrThrow("VERIFIED_DOMAINS").split(",");
    const clientsString = this.getOrThrow("CLIENTS");
    clientsString.split(",").forEach(clientStr => {
      const clientPair = clientStr.split(":");
      if (!clientPair || clientPair.length != 2) throw new Error("Invalid client pair.");
      this.clients[clientPair[0]] = clientPair[1];
    });

    // Read AUDIENCE and ISSUER environment variables and store them
    this.audience = this.getOrThrow("AUDIENCE");
    this.issuer = this.getOrThrow("ISSUER");
  }

  /**
   * Gets the singleton instance of the Environment class.
   * If the instance does not exist, it creates a new one.
   * @returns {Environment} The singleton instance of the Environment class.
   */
  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return this.instance;
  }

  /**
   * Retrieves the secret key associated with the provided client identifier.
   *
   * @param {string} clientId - The client identifier for which to retrieve the secret.
   * @throws {ArgumentNullError} If the `clientId` parameter is null or empty.
   * @returns {string} The secret key associated with the specified `clientId`.
   */
  public getSecret(clientId: string): string {
    if (!clientId) throw new ArgumentNullError("clientId");
    const secret = this.clients[clientId];

    if (!secret) throw new ServerError();
    return secret;
  }

  /**
   * Helper function to get the value of an environment variable.
   * Throws an error if the value is not defined.
   * @param {string} value - The environment variable to fetch.
   * @returns {string} The value of the environment variable.
   * @throws {Error} If the environment variable is not defined.
   */
  private getOrThrow(key?: string): string {
    if (!key) throw new Error(`Missing required environment key`);
    const value: string = process.env[key] || "";
    if (!value) throw new Error(`Missing required environment variable(${key})`);
    return value;
  }
}