import express, { Router } from "express";
import { authenticateWithGoogle } from "./authenticationController";
import { authenticationValidator } from "./authenticationValidator";


export const NAME = "authenticate";
export const router: Router = express.Router();

router.post("/google", authenticationValidator, authenticateWithGoogle)