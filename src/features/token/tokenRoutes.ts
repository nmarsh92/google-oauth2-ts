import express, { Router } from "express";
import { getToken, invalidate, introspect } from "./tokenController";
import { introspectRequestValidator, invalidateRequestValidator, tokenRequestValidator } from "./tokenValidator";
import { isAuthorized } from "../../shared/middleware/auth";


export const NAME = "token";
export const router: Router = express.Router();

router.post("", tokenRequestValidator, getToken);
router.post("/introspect", isAuthorized, introspectRequestValidator, introspect)
router.post("/invalidate", invalidateRequestValidator, invalidate)
