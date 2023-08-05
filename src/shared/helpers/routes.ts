import { Router, Express } from "express";
import { VERSION_1 } from "../constants/api";

/**
 * Adds routes to the Express application.
 *
 * @param {Express} app - The Express application.
 * @param {string} name - The name of the route.
 * @param {Router} router - The router containing the route handlers.
 */
export const UseRoutes = (app: Express, name: string, router: Router) => {
  /**
   * The base route for the specified version and name.
   * @type {string}
   */
  const route = `/api/${VERSION_1}/${name}`;

  // Use the provided router for the specified route.
  app.use(route, router);
};