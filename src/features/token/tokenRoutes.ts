import express, { Router } from "express";
import { getToken, invalidate, introspect } from "./tokenController";


export const name = 'token';
export const router: Router = express.Router();

router.get("/", getToken);
router.get("/introspect", introspect)
router.get("/invalidate", invalidate)
