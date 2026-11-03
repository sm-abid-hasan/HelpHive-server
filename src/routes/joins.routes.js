import { Router } from "express";
import { getMyJoins } from "../controllers/joins.controller.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.get("/my", verifyJWT, getMyJoins);

export default router;
