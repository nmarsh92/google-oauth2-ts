import { Environment } from "../environment";
import { ArgumentNullError } from "../errors/argument-null-error";
import { ServerError } from "../errors/server-error";

describe("Environment", () => {




  describe("constructor", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
      process.env.PORT = "8080";
      process.env.DB = "test-db";
      process.env.GOOGLE_CLIENT_ID = "test-client-id";
      process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
      process.env.GOOGLE_HD_ALLOWED_DOMAINS = "example.com,test.com";
      process.env.CLIENTS = "client1:secret1,client2:secret2,valid-client-id:valid-secret-key";
      process.env.ISSUER = "test-issuer";
      process.env.AUDIENCES = "test-audience1,test-audience2";
    });

    it("should set the isProduction property to false if the NODE_ENV environment variable is not set to 'production'", () => {
      const environment = Environment.getInstance();

      expect(environment.isProduction).toBe(false);
    });

    it("should set the port property to the value of the PORT environment variable if it is set and the NODE_ENV environment variable is not set to 'production'", () => {
      const environment = Environment.getInstance();

      expect(environment.port).toBe(8080);
    });

    it("should set the db property to the value of the DB environment variable", () => {
      const environment = Environment.getInstance();

      expect(environment.db).toBe("test-db");
    });

    it("should set the googleClientId property to the value of the GOOGLE_CLIENT_ID environment variable", () => {
      const environment = Environment.getInstance();

      expect(environment.googleClientId).toBe("test-client-id");
    });

    it("should set the googleSecret property to the value of the GOOGLE_CLIENT_SECRET environment variable", () => {
      const environment = Environment.getInstance();

      expect(environment.googleSecret).toBe("test-client-secret");
    });

    it("should set the verifiedDomains property to the value of the GOOGLE_HD_ALLOWED_DOMAINS environment variable, split by commas", () => {
      const environment = Environment.getInstance();

      expect(environment.verifiedDomains).toEqual(["example.com", "test.com"]);
    });

    it("should set the clients property to an object containing the client pairs from the CLIENTS environment variable", () => {
      const environment = Environment.getInstance();

      expect(environment.clients).toEqual({ client1: "secret1", client2: "secret2", "valid-client-id": "valid-secret-key" });
    });

    it("should set the issuer property to the value of the ISSUER environment variable", () => {
      const environment = Environment.getInstance();

      expect(environment.issuer).toBe("test-issuer");
    });

    it("should set the audiences property to the value of the AUDIENCES environment variable, split by commas", () => {
      const environment = Environment.getInstance();

      expect(environment.audiences).toEqual(["test-audience1", "test-audience2"]);
    });
  });

});