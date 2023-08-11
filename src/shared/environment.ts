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
   * An dictionary of auth clients.
   */
  public readonly clients: Record<string, string> = {};

  /**
   *  Allowed audiences.
   */
  public readonly audiences: string[] = new Array<string>();

  /**
   * The issuer claim for JWT.
   */
  public readonly issuer: string;

  /**
   * The number of minutes before an access token expires.
   * Defaults to 30 minutes if not provided.
   */
  public readonly accessTokenExpiresInMs: number = 1000 * 60 * 30;

  /**
   * The number of days before a refresh token expires.
   * Defaults to 10 days if not provided.
   */
  public readonly refreshTokenExpiresInMs: number = 1000 * 60 * 60 * 24 * 10;


  /**
   * Private constructor to enforce the singleton pattern.
   * Initializes all the properties from the environment variables.
   */
  private constructor() {
    this.isProduction = process.env.NODE_ENV === PRODUCTION;
    this.port = this.isProduction ? 80 : parseInt(process.env.PORT || "8080");
    this.db = this.getOrThrow("DB");
    this.googleClientId = this.getOrThrow("GOOGLE_CLIENT_ID");
    this.googleSecret = this.getOrThrow("GOOGLE_CLIENT_SECRET");
    this.verifiedDomains = this.getOrThrow("GOOGLE_HD_ALLOWED_DOMAINS").split(",");
    const clientsString = this.getOrThrow("CLIENTS");
    clientsString.split(",").forEach(clientStr => {
      const clientPair = clientStr.split(":");
      if (!clientPair || clientPair.length != 2) throw new Error("Invalid client pair.");
      this.clients[clientPair[0]] = clientPair[1];
    });
    this.issuer = this.getOrThrow("ISSUER");
    this.audiences = this.getOrThrow("AUDIENCES").split(",");

    const optionalAccessTokenExpiresInMinutes = this.getOptional("ACCESS_TOKEN_EXPIRATION_MINUTES");
    const optionalRefreshTokenExpiresInDays = this.getOptional("REFRESH_TOKEN_EXPIRATION_DAYS");
    if (optionalAccessTokenExpiresInMinutes)
      this.accessTokenExpiresInMs = parseInt(optionalAccessTokenExpiresInMinutes) * 60 * 1000;

    if (optionalRefreshTokenExpiresInDays)
      this.refreshTokenExpiresInMs = parseInt(optionalRefreshTokenExpiresInDays) * 24 * 60 * 60 * 1000;

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

    if (!secret) throw new ServerError(`Client secret not found for client id: ${clientId}`);
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

  /**
   *  Helper function to get the value of an environment variable.
   * @param key 
   * @returns 
   */
  private getOptional(key?: string): string | undefined {
    if (!key) return undefined;
    const value: string = process.env[key] || "";
    if (!value) return undefined;
    return value;
  }
}