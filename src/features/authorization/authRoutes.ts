import express, { Router } from "express";
import { authenticateWithGoogle } from "./authenticationController";


export const name = 'authenticate';
export const router: Router = express.Router();

router.post("/google", authenticateWithGoogle)