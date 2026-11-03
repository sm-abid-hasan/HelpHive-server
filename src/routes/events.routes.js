import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getMyEvents,
  getUpcomingEvents,
  updateEvent,
} from "../controllers/events.controller.js";
import { checkJoined, joinEvent, leaveEvent } from "../controllers/joins.controller.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();


router.get("/", getUpcomingEvents);


router.get("/my", verifyJWT, getMyEvents);

router.get("/:id", getEventById);


router.post("/", verifyJWT, createEvent);
router.put("/:id", verifyJWT, updateEvent);
router.delete("/:id", verifyJWT, deleteEvent);

router.post("/:id/join", verifyJWT, joinEvent);
router.delete("/:id/join", verifyJWT, leaveEvent);
router.get("/:id/joined", verifyJWT, checkJoined);

export default router;
