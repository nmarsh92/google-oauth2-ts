import { Express, Router } from "express";
import { UseRoutes } from "../../helpers/routes";

describe("UseRoutes", () => {
  let app: Express;
  let name: string;
  let router: Router;

  beforeEach(() => {
    app = {
      use: jest.fn(),
    } as unknown as Express;
    name = "test";
    router = {} as Router;
  });

  it("should add the router to the app with the correct route", () => {
    UseRoutes(app, name, router);

    expect(app.use).toHaveBeenCalledWith(`/api/v1/${name}`, router);
  });
});