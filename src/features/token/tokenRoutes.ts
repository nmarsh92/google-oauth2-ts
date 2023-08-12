import express, { Router } from "express";
import { getToken, revoke, introspect, revokeAll } from "./tokenController";
import { introspectRequestValidator, revokeRequestValidator, tokenRequestValidator } from "./tokenValidator";
import { isAuthorizedBasic, isAuthorizedBearer } from "../../shared/middleware/auth";


export const NAME = "token";
export const router: Router = express.Router();

router.post("", tokenRequestValidator, getToken);
router.post("/introspect", isAuthorizedBasic, introspectRequestValidator, introspect);
router.post("/revoke", revokeRequestValidator, revoke);
router.post("/revokeAll", isAuthorizedBearer, revokeAll);
