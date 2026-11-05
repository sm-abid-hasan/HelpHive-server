import { ObjectId } from "mongodb";
import { eventsCollection, joinsCollection } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { startOfTodayUTC } from "../utils/validateEvent.js";

const isValidId = (id) => /^[a-f\d]{24}$/i.test(String(id));


export const joinEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid event id." });

  const events = await eventsCollection();
  const event = await events.findOne({ _id: new ObjectId(id) });
  if (!event) return res.status(404).json({ message: "Event not found." });

  if (event.eventDate < startOfTodayUTC()) {
    return res.status(400).json({ message: "This event has already ended." });
  }

  const joins = await joinsCollection();
  try {
    await joins.insertOne({
      eventId: event._id,
      eventTitle: event.title,
      userEmail: req.user.email,
      userName: req.user.name,
      userPhoto: req.user.image,
      joinedAt: new Date(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already joined this event." });
    }
    throw error;
  }

  await events.updateOne({ _id: event._id }, { $inc: { participantsCount: 1 } });
  res.status(201).json({ message: "You successfully joined the event ." });
});


export const leaveEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid event id." });

  const joins = await joinsCollection();
  const result = await joins.deleteOne({ eventId: new ObjectId(id), userEmail: req.user.email });
  if (result.deletedCount === 0) return res.status(404).json({ message: "You have not joined this event." });

  const events = await eventsCollection();
  await events.updateOne({ _id: new ObjectId(id), participantsCount: { $gt: 0 } }, { $inc: { participantsCount: -1 } });

  res.json({ message: "You left the event." });
});


export const checkJoined = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid event id." });

  const joins = await joinsCollection();
  const found = await joins.findOne({ eventId: new ObjectId(id), userEmail: req.user.email });
  res.json({ joined: Boolean(found) });
});

export const getMyJoins = asyncHandler(async (req, res) => {
  const joins = await joinsCollection();

  const result = await joins
    .aggregate([
      { $match: { userEmail: req.user.email } },
      { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
      { $unwind: "$event" },
      { $sort: { "event.eventDate": 1 } },
      { $project: { _id: 1, joinedAt: 1, event: 1 } },
    ])
    .toArray();

  res.json(result);
});
