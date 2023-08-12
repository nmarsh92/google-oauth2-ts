import express, { Router } from "express";
import { authenticateWithGoogle } from "./authenticationController";
import { authenticationValidator } from "./authenticationValidator";
import { checkCsrf } from "../../shared/middleware/csrf";


export const NAME = "authenticate";
export const router: Router = express.Router();

router.post("/google", checkCsrf, authenticationValidator, authenticateWithGoogle);